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
        { name: "Folders", description: "Folder hierarchy operations" },
        { name: "Files", description: "File upload and management" },
        { name: "Admin", description: "Admin-only operations" }
    ],
};

const options: Options = {
    definition: swaggerDefinition as any,
    // Scan feature routes (auth, packages, folders, files, etc.) for @openapi JSDoc
    apis: ["./src/features/**/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);