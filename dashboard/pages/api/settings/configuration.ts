import { NextApiRequest, NextApiResponse } from 'next';

import authHandler from '@/middleware/auth';
import SettingModel from '@/models/setting';
import { defaultSettings } from '@/utils/constants';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse<{ message: string }>, user) => {
  if (!user?.acl?.admin && !user?.acl?.owner) return res.status(403).json({ message: 'Unauthorized' });
  const setting = await SettingModel.findOne({});
  if (!setting) {
    // create new setting
    const newSetting = new SettingModel({ ...defaultSettings, ...req.body });
    await newSetting.save();
    return res.status(200).json({ message: 'Configuration updated successfully' });
  }

  setting.polling = req.body.polling;
  setting.logRotation = req.body.logRotation;
  setting.registrationCode = req.body.registrationCode;
  setting.excludeDaemon = req.body.excludeDaemon;

  await setting.save();
  return res.status(200).json({ message: 'Configuration updated successfully' });
});
