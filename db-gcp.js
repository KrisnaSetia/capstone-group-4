// import mysql from "mysql";
// import { getVercelOidcToken } from "@vercel/functions/oidc";
// import { ExternalAccountClient } from "google-auth-library";
// import dotenv from "dotenv";

// dotenv.config();

// export async function connectDatabase() {
//   const audience = process.env.GCP_AUDIENCE;
//   if (!audience) {
//     throw new Error("Missing environment variable: GCP_AUDIENCE");
//   }

//   const authClient = ExternalAccountClient.fromJSON({
//     universe_domain: "googleapis.com",
//     type: "external_account",
//     audience: audience,
//     subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
//     token_url: "https://sts.googleapis.com/v1/token",
//     service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
//     subject_token_supplier: {
//       getSubjectToken: getVercelOidcToken,
//     },
//   });

//   const accessTokenResponse = await authClient.getAccessToken();
//   const token = accessTokenResponse.token;

//   console.log("GCP_AUDIENCE:", process.env.GCP_AUDIENCE);
//   console.log("SERVICE_ACCOUNT_EMAIL:", process.env.GCP_SERVICE_ACCOUNT_EMAIL);
//   console.log("TOKEN (first 20 chars):", token?.substring(0, 20));
//   console.log(
//     "CLOUD_SQL_INSTANCE_CONNECTION_NAME:",
//     process.env.CLOUD_SQL_INSTANCE_CONNECTION_NAME
//   );

//   const connection = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     port: process.env.DATABASE_PORT,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
//   });

//   // optional: tes koneksi segera saat membuat
//   connection.connect((err) => {
//     if (err) {
//       console.error("Database connection error:", err);
//     } else {
//       console.log("Connected to database successfully.");
//     }
//   });

//   return connection;
// }
