import { Request, Response, NextFunction } from 'express';
import trackerService from '../services/trackerService';
import logger from '../utils/logger';

const trackerController = {
  // Add a new tracker
  async addTracker(req: Request, res: Response) {
    try {
      const { trackerName, targetHours, description, workDays, userId } = req.body;

      if (!trackerName || !targetHours || !userId) {
        res.status(400).json({
          success: false,
          error: 'Tracker name, target hours, and user ID are required'
        });
        return;
      }

      const result = await trackerService.addTracker({
        userId: parseInt(userId, 10),
        trackerName,
        targetHours: parseInt(targetHours, 10),
        description: description || '',
        workDays
      });

      if (result.success) {
        res.status(201).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error adding tracker: ${(err as Error).message}`);
    }
  },

  // Start a tracker
  async startTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tracker ID is required'
        });
        return;
      }

      const result = await trackerService.startTracker(parseInt(id, 10));

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error starting tracker: ${(err as Error).message}`);
    }
  },

  // Stop a tracker
  async stopTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tracker ID is required'
        });
        return;
      }

      const result = await trackerService.stopTracker(parseInt(id, 10));

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error stopping tracker: ${(err as Error).message}`);
    }
  },

  // Archive a tracker
  async archiveTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tracker ID is required'
        });
        return;
      }

      const result = await trackerService.archiveTracker(parseInt(id, 10));

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error archiving tracker: ${(err as Error).message}`);
    }
  },

  // Delete a tracker
  async deleteTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tracker ID is required'
        });
        return;
      }

      const result = await trackerService.deleteTracker(parseInt(id, 10));

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error deleting tracker: ${(err as Error).message}`);
    }
  },

  // Get all trackers
  async getAllTrackers(req: Request, res: Response) {
    try {
      const result = await trackerService.getAllTrackers();

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error getting trackers: ${(err as Error).message}`);
    }
  },

  // Get all active sessions
  async getAllActiveSessions(req: Request, res: Response) {
    try {
      const result = await trackerService.getAllActiveSessions();

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error getting active sessions: ${(err as Error).message}`);
    }
  },

  // Get sessions for a tracker
  async getSessions(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tracker ID is required'
        });
        return;
      }

      const result = await trackerService.getSessions(parseInt(id, 10));

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error getting sessions: ${(err as Error).message}`);
    }
  },

  // Get work stats for a tracker
  async getWorkStats(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tracker ID is required'
        });
        return;
      }

      const result = await trackerService.computeWorkStatsByTrackerId(parseInt(id, 10));

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Controller error getting work stats: ${(err as Error).message}`);
    }
  },
};

export default trackerController;