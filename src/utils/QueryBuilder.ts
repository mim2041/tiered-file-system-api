// @ts-nocheck
import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;
  public filterQuery: FilterQuery<T> = {};

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm as string;
    if (searchTerm) {
      const words = searchTerm.split(" ").filter((word) => word.trim() !== "");
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields
          .filter((field) => field !== "serialID")
          .map((field) => {
            return {
              [field]: {
                $regex: words.map((word) => `(?=.*${word})`).join(""),
                $options: "i",
              },
            };
          }),
      });
    }

    return this;
  }

  filter(additionalFilter?: FilterQuery<T>) {
    const queryObj = { ...this.query };

    const excludeFields = ["searchTerm", "sort", "sortBy", "sortOrder", "limit", "page", "fields"];

    excludeFields.forEach((el) => delete (queryObj as any)[el]);

    if ((queryObj as any).serialID) {
      const parsedSerialID = Number((queryObj as any).serialID);
      if (!isNaN(parsedSerialID)) {
        (queryObj as any).serialID = parsedSerialID;
      } else {
        delete (queryObj as any).serialID;
      }
    }

    Object.keys(queryObj).forEach((key) => {
      if ((queryObj as any)[key] === "true") {
        (queryObj as any)[key] = true;
      } else if ((queryObj as any)[key] === "false") {
        (queryObj as any)[key] = false;
      }
    });

    Object.keys(queryObj).forEach((key) => {
      if (
        (queryObj as any)[key] === undefined ||
        (queryObj as any)[key] === null ||
        (queryObj as any)[key] === ""
      ) {
        delete (queryObj as any)[key];
      }
    });

    const finalFilter = { ...queryObj, ...additionalFilter } as FilterQuery<T>;
    this.filterQuery = finalFilter;
    this.modelQuery = this.modelQuery.find(finalFilter);

    return this;
  }

  sort() {
    let primarySort: string;

    if ((this.query as any)?.sort) {
      primarySort = (this.query as any).sort.toString().split(",").join(" ");
    } else if ((this.query as any)?.sortBy) {
      const sortField = (this.query as any).sortBy.toString();
      const sortOrder =
        (this.query as any).sortOrder?.toString().toLowerCase() === "asc" ? "" : "-";
      primarySort = `${sortOrder}${sortField}`;
    } else {
      primarySort = "-createdAt";
    }

    const sortOrder = `${primarySort} _id`;
    this.modelQuery = this.modelQuery.sort(sortOrder);
    return this;
  }

  paginate() {
    const page = Math.max(Number((this.query as any)?.page) || 1, 1);
    const limit = Math.max(Number((this.query as any)?.limit) || 10, 1);
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields(selectedFields?: string[]) {
    const fields = selectedFields
      ? selectedFields.join(" ")
      : (this.query as any)?.fields
      ? (this.query as any).fields.toString().split(",").join(" ")
      : "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = { ...this.filterQuery, isDeleted: { $ne: true } };
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Math.max(Number((this.query as any)?.page) || 1, 1);
    const limit = Math.max(Number((this.query as any)?.limit) || 10, 1);
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;

