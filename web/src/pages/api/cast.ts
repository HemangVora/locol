import { NextApiRequest, NextApiResponse } from "next";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

// Create Neynar API client with API key
const client = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { signerUuid, text } = req.body as {
    signerUuid: string;
    text: string;
  };

  try {
    const response = await client.publishCast({
      signerUuid,
      text,
    });
    return res.status(200).json({
      message: `Cast published successfully`,
    });
  } catch (err) {
    if (isApiErrorResponse(err)) {
      return res.status(err.response.status).json({
        ...err.response.data,
      });
    } else {
      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
}
