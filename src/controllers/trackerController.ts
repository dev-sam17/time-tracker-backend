import { Request, Response, NextFunction } from "express";
import trackerService from "../services/trackerService";
import logger from "../utils/logger";

const trackerController = {
  // Add a new tracker
  async addTracker(req: Request, res: Response) {
    try {
      const { trackerName, targetHours, description, workDays, userId } =
        req.body;

      if (!trackerName || !targetHours || !userId) {
        res.status(400).json({
          success: false,
          error: "Tracker name, target hours, and user ID are required",
        });
        return;
      }

      const result = await trackerService.addTracker({
        userId: userId,
        trackerName,
        targetHours: parseInt(targetHours, 10),
        description: description || "",
        workDays,
      });

      if (result.success) {
        res.status(201).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error adding tracker: ${(err as Error).message}`
      );
    }
  },

  // Start a tracker
  async startTracker(req: Request, res: Response) {
    try {
      const { id: trackerId } = req.params;
      if (!trackerId) {
        res.status(400).json({ error: "Tracker ID is required" });
        return;
      }
      const result = await trackerService.startTracker(trackerId);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error starting tracker: ${(err as Error).message}`
      );
    }
  },

  // Stop a tracker
  async stopTracker(req: Request, res: Response) {
    try {
      const { id: trackerId } = req.params;

      if (!trackerId) {
        res.status(400).json({
          success: false,
          error: "Tracker ID is required",
        });
        return;
      }

      const result = await trackerService.stopTracker(trackerId);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error stopping tracker: ${(err as Error).message}`
      );
    }
  },

  // Archive a tracker
  async archiveTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Tracker ID is required",
        });
        return;
      }

      const result = await trackerService.archiveTracker(id);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error archiving tracker: ${(err as Error).message}`
      );
    }
  },

  //unarchive a tracker
  async unarchiveTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Tracker ID is required",
        });
        return;
      }

      const result = await trackerService.unarchiveTracker(id);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error unarchiving tracker: ${(err as Error).message}`
      );
    }
  },

  // Delete a tracker
  async deleteTracker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Tracker ID is required",
        });
        return;
      }

      const result = await trackerService.deleteTracker(id);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error deleting tracker: ${(err as Error).message}`
      );
    }
  },

  // Get all trackers
  async getAllTrackers(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== "string") {
        res.status(400).json({
          success: false,
          error: "User ID is required as query parameter",
        });
        return;
      }

      const result = await trackerService.getAllTrackers(userId);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error getting trackers: ${(err as Error).message}`
      );
    }
  },

  // Get all active sessions
  async getAllActiveSessions(req: Request, res: Response) {
    try {
      const result = await trackerService.getAllActiveSessions(
        req.params.userId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err) {
      logger.error(`Error getting active sessions: ${(err as Error).message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get sessions for a tracker
  async getSessions(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Tracker ID is required",
        });
        return;
      }

      const result = await trackerService.getSessions(id);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error getting sessions: ${(err as Error).message}`
      );
    }
  },

  // Get work stats for a tracker
  async getWorkStats(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Tracker ID is required",
        });
        return;
      }

      const result = await trackerService.computeWorkStatsByTrackerId(id);

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Controller error getting work stats: ${(err as Error).message}`
      );
    }
  },

  // Get daily totals for a user with custom date range
  async getDailyTotals(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate, trackerId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: "startDate and endDate query parameters are required",
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD",
        });
        return;
      }

      const result = await trackerService.getDailyTotalsForUser(
        userId,
        start,
        end,
        trackerId as string | undefined
      );

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(`Error getting daily totals: ${(err as Error).message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get daily totals for predefined periods (week, month, year)
  async getDailyTotalsForPeriod(req: Request, res: Response) {
    try {
      const { userId, period } = req.params;
      const { trackerId } = req.query;

      if (!["week", "month", "year"].includes(period)) {
        res.status(400).json({
          success: false,
          error: "Period must be one of: week, month, year",
        });
        return;
      }

      const result = await trackerService.getDailyTotalsForPeriod(
        userId,
        period as "week" | "month" | "year",
        trackerId as string | undefined
      );

      if (result.success) {
        res.status(200).json(result);
        return;
      } else {
        res.status(400).json(result);
        return;
      }
    } catch (err) {
      logger.error(
        `Error getting daily totals for period: ${(err as Error).message}`
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default trackerController;
