import { NextApiRequest, NextApiResponse } from "next";
import {
  findUserByFid,
  createOrUpdateUser,
  updateWalletAddress,
  updateUserData,
} from "../../services/userService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { fid } = req.query;

        if (!fid || Array.isArray(fid)) {
          return res
            .status(400)
            .json({ success: false, message: "Valid FID is required" });
        }

        const user = await findUserByFid(parseInt(fid));

        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, data: user });
      } catch (error) {
        console.error("Error fetching user:", error);
        return res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while fetching the user",
          });
      }

    case "POST":
      try {
        const userData = req.body;

        // Validate required fields
        if (!userData.fid || !userData.username) {
          return res
            .status(400)
            .json({ success: false, message: "FID and username are required" });
        }

        const user = await createOrUpdateUser(userData);

        return res.status(200).json({ success: true, data: user });
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while saving the user",
          });
      }

    case "PUT":
      try {
        const { fid, walletAddress, web3Score, generalScore, casts } = req.body;

        if (!fid) {
          return res
            .status(400)
            .json({ success: false, message: "FID is required" });
        }

        // Get existing user to make sure it exists
        const existingUser = await findUserByFid(fid);

        if (!existingUser) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        // Update user data
        const updatedUser = await updateUserData(fid, {
          walletAddress,
          web3Score,
          generalScore,
          casts,
        });

        return res.status(200).json({ success: true, data: updatedUser });
      } catch (error) {
        console.error("Error updating user data:", error);
        return res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while updating the user",
          });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      return res
        .status(405)
        .json({ success: false, message: `Method ${method} not allowed` });
  }
}
