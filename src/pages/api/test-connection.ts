// import type { NextApiRequest, NextApiResponse } from "next";
// import { connectDatabase } from "@/../db-gcp";
// import "dotenv/config";

// type SuccessResponse = {
//   success: true;
//   message: string;
//   mysqlVersion: string;
//   database: string;
// };

// type ErrorResponse = {
//   success: false;
//   message: string;
//   error: string;
// };

// type ResponseData = SuccessResponse | ErrorResponse;

// interface VersionRow {
//   version: string;
// }

// interface DbNameRow {
//   db: string;
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<ResponseData>
// ) {
//   let db: Awaited<ReturnType<typeof connectDatabase>> | null = null;

//   try {
//     db = await connectDatabase();

//     const versionResult = (await db.query(
//       "SELECT VERSION() AS version"
//     )) as unknown as [VersionRow[]];
//     const dbNameResult = (await db.query(
//       "SELECT DATABASE() AS db"
//     )) as unknown as [DbNameRow[]];

//     const versionRows = versionResult[0];
//     const dbNameRows = dbNameResult[0];

//     if (!versionRows.length || !dbNameRows.length) {
//       throw new Error("Unexpected database response format");
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Database connection successful!",
//       mysqlVersion: versionRows[0].version,
//       database: dbNameRows[0].db,
//     });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : String(error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to connect to database",
//       error: message,
//     });
//   } finally {
//     if (db) {
//       db.end(); // versi mysql biasa tidak perlu pakai await
//     }
//   }
// }
