import swaggerJsdoc, { Options } from "swagger-jsdoc";
import { env } from "./env-config";

const swaggerDefinition = {
    openapi: "3.1.0",
    info: {
        title: "Tiered File System API",
        version: env.version,
        description: "SaaS File Management System backend for subscription-based file & folder management.",
    },
    servers: [
        {
            url: `http://localhost:${env.port}`,
            description: `${env.nodeEnv} server`,
        },
    ],
    tags: [
        { name: "Health", description: "Service health and status" },
        { name: "Auth", description: "Authentication & user access" },
        { name: "Packages", description: "Subscription packages management" },
        { name: "Subscriptions", description: "User subscriptions and history" },
        { name: "Folders", description: "Folder hierarchy operations" },
        { name: "Files", description: "File upload and management" },
        { name: "Admin", description: "Admin-only operations" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            AuthTokens: {
                type: "object",
                properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                },
            },
            PublicUser: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    email: { type: "string", format: "email" },
                    name: { type: "string" },
                    role: { type: "string", enum: ["ADMIN", "USER"] },
                    isVerified: { type: "boolean" },
                },
            },
            AuthResponse: {
                type: "object",
                properties: {
                    user: { $ref: "#/components/schemas/PublicUser" },
                    tokens: { $ref: "#/components/schemas/AuthTokens" },
                },
            },
            SubscriptionPackage: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    slug: { type: "string" },
                    description: { type: "string", nullable: true },
                    maxFolders: { type: "integer" },
                    maxNestingLevel: { type: "integer" },
                    maxFileSizeMb: { type: "integer" },
                    totalFileLimit: { type: "integer" },
                    filesPerFolderLimit: { type: "integer" },
                    allowedFileTypes: {
                        type: "array",
                        items: { type: "string" },
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            ApiError: {
                type: "object",
                properties: {
                    status: { type: "integer" },
                    success: { type: "boolean" },
                    code: { type: "string" },
                    message: { type: "string" },
                    details: {},
                    path: { type: "string" },
                },
            },
        },
    },
};

const options: Options = {
    definition: swaggerDefinition as any,
    // Scan feature routes (auth, packages, folders, files, etc.) for @openapi JSDoc
    apis: ["./src/features/**/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);