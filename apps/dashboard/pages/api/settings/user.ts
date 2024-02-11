import { NextApiRequest, NextApiResponse } from "next";

import authHandler from "@/middleware/auth";
import { userModel } from "@pm2.web/mongoose-models";

export default authHandler(
  async (req: NextApiRequest, res: NextApiResponse<{ message: string; field?: string }>, user) => {
    if (req.method == "POST") {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      if (!oldPassword || !newPassword || !confirmPassword) return res.status(403).json({ message: "Missing fields" });
      if (newPassword != confirmPassword)
        return res.status(403).json({
          message: "Passwords do not match",
          field: "confirmPassword",
        });
      if (!(await user.checkPassword(oldPassword)))
        return res.status(403).json({ message: "Password is incorrect", field: "oldPassword" });
      user.password = newPassword;
      await user.save();
      return res.status(200).json({ message: "Password changed successfully" });
    } else if (req.method == "DELETE") {
      const { password } = req.body;
      if (!password) return res.status(403).json({ message: "Missing fields" });
      if (!(await user.checkPassword(password))) return res.status(403).json({ message: "Password is incorrect" });
      await userModel.findByIdAndDelete(user._id);
      return res.status(200).json({ message: "Account deleted successfully" });
    }
  },
);
