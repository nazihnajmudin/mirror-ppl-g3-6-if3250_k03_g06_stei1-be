import * as notificationService from '../../services/notification.service';
import prisma from '../../config/database.config';

// Mock Prisma
jest.mock('../../config/database.config', () => ({
  __esModule: true,
  default: {
    notification: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Notification Service Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return all notifications for SUPER_ADMIN', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([{ id: '1' }, { id: '2' }]);
      
      const result = await notificationService.getNotifications('SUPER_ADMIN', null);
      
      expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { createdAt: 'desc' }
      }));
      expect(result).toHaveLength(2);
    });

    it('should return all notifications for PIMPINAN', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([{ id: '1' }]);
      
      const result = await notificationService.getNotifications('PIMPINAN', null);
      
      expect(prisma.notification.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should filter by prodiId for other roles', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([{ id: '3' }]);
      
      const result = await notificationService.getNotifications('KAPRODI', 'prodi-1');
      
      expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { prodiId: 'prodi-1' }
      }));
      expect(result).toHaveLength(1);
    });

    it('should return empty if no prodiId provided for other roles', async () => {
      const result = await notificationService.getNotifications('TIM_PRODI', null);
      
      expect(prisma.notification.findMany).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
