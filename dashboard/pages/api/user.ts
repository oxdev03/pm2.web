import { NextApiRequest, NextApiResponse } from 'next';

import authHandler from '@/middleware/auth';
import { Server } from '@/types/user';

import User from '../../models/user';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse<{ message: string }>, reqUser) => {
  if (!reqUser?.acl?.admin && !reqUser?.acl?.owner) return res.status(403).json({ message: 'Unauthorized' });
  switch (req.method) {
    case 'DELETE':
      try {
        const user = await User.findById(req.query.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.acl?.owner) return res.status(403).json({ message: 'Owner cannot be deleted' });
        if (user.acl?.admin && !reqUser?.acl?.owner) return res.status(403).json({ message: 'Unauthorized' });

        await User.findByIdAndRemove(req.query.id);
        return res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'PATCH':
      try {
        const { id, permission } = req.body;
        const user = await User.findById(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.acl?.owner && !reqUser?.acl?.owner) return res.status(403).json({ message: 'Unauthorized' });
        if (!['owner', 'admin', 'custom', 'none'].includes(permission)) return res.status(400).json({ message: 'Invalid permission' });
        // edge case where user is owner and is trying to remove their own owner perms
        if (reqUser?.acl?.admin && permission === 'owner') return res.status(403).json({ message: 'Admin cannot change permission to owner' });
        if (reqUser._id.toString() == user._id.toString()) {
          if (user.acl?.owner && permission !== 'owner') {
            // check if other owners exist
            const owners = await User.find({ 'acl.owner': true });
            if (owners.length <= 1) return res.status(403).json({ message: 'Owner cannot be removed, Promote someone to an owner before' });
          }
        }

        user.acl = {
          owner: permission === 'owner' ? true : false,
          admin: permission === 'admin' ? true : false,
          servers: [],
        };
        await user.save().catch((err) => console.error(err));
        return res.status(200).json({ message: 'Updated permissions successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'POST':
      try {
        let {
          users: _users,
          perms,
        }: {
          users: string[];
          perms: Server[];
        } = req.body;

        const users = await User.find({ _id: { $in: _users } });
        if (!users || !perms) return res.status(400).json({ message: 'Missing fields' });
        if (!users) return res.status(404).json({ message: 'Users not found' });

        // remove process if perms equals to server perms => save db storage
        perms = perms.filter((server) => {
          server.processes = server.processes.filter((process) => !(process.perms === server.perms));
          return server.processes.length > 0 || server.perms !== 0;
        });

        for (const user of users) {
          user.acl.servers = perms;
          await user.save().catch((err) => console.error(err));
        }
        return res.status(200).json({ message: 'Updated permissions successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
});
