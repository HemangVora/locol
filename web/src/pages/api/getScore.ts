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

  const { fid } = req.body as {
    fid: number;
  };
  console.log(fid);
  try {
    const url = `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=25&include_replies=true`;

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-neynar-experimental": "false",
        "x-api-key": process.env.NEYNAR_API_KEY!,
      },
    };

    let response = await fetch(url, options);
    let data = await response.json();
    console.log(data);
    return res.status(200).json({
      message: `Cast published successfully`,
      data,
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
