import pm2 from 'pm2';

import { Packet, QueuedLog } from '@pm2.web/typings';
import censorMessage from '../utils/censorMessage.js';

class LogCapture {
  private queuedLogs: QueuedLog[] = [];

  constructor() {}

  capture(): void {
    pm2.launchBus((err, bus) => {
      bus.on('log:err', (packet: Packet) => {
        this.queuedLogs.push({
          id: packet.process.pm_id,
          type: 'error',
          message: censorMessage(`[${packet.process.name}] ${packet.data}`.replace(/\n$/, '')),
          createdAt: new Date(),
        });
      });

      bus.on('log:out', (packet: Packet) => {
        this.queuedLogs.push({
          id: packet.process.pm_id,
          type: 'success',
          message: censorMessage(`[${packet.process.name}] ${packet.data}`.replace(/\n$/, '')),
          createdAt: new Date(),
        });
      });

      bus.on('process:event', (packet: Packet) => {
        if (packet.event === 'online') {
          this.queuedLogs.push({
            id: packet.process.pm_id,
            type: 'info',
            message: `[${packet.process.name}] Process online`,
            createdAt: new Date(),
          });
        } else if (packet.event === 'exit') {
          this.queuedLogs.push({
            id: packet.process.pm_id,
            type: 'info',
            message: `[${packet.process.name}] Process offline`,
            createdAt: new Date(),
          });
        }
      });
    });
  }

  clear(): QueuedLog[] {
    const shallowCopy = [...this.queuedLogs];
    this.queuedLogs = [];
    return shallowCopy;
  }
}

export default LogCapture;
