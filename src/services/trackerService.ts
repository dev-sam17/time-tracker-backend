import prisma from "../models/prisma";
import logger from "../utils/logger";

// Define types
interface TrackerInput {
  userId: string;
  trackerName: string;
  targetHours: number;
  description: string;
  workDays?: string; // Optional, will use default from schema if not provided
}

// Tracker Service
export default {
  // Add a new tracker
  async addTracker(data: TrackerInput) {
    try {
      const tracker = await prisma.tracker.create({
        data: {
          trackerName: data.trackerName,
          targetHours: data.targetHours,
          description: data.description,
          workDays: data.workDays || "1,2,3,4,5", // Use default if not provided
          user: {
            connect: {
              id: data.userId,
            },
          },
        },
      });

      logger.info(`Added tracker with ID: ${tracker.id} for user: ${data.userId}`);
      return { success: true, message: "Tracker added.", data: tracker };
    } catch (err) {
      logger.error(`Error adding tracker: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Start tracking time for a tracker
  async startTracker(trackerId: string) {
    try {
      // Check if tracker exists and update its updatedAt timestamp
      const tracker = await prisma.tracker.update({
        where: { id: trackerId },
        data: { updatedAt: new Date() },
      });

      if (!tracker) {
        return { success: false, error: "Tracker not found." };
      }

      // Check if there's already an active session
      const existing = await prisma.activeSession.findUnique({
        where: { trackerId },
      });

      if (!existing) {
        // Create a new active session
        await prisma.activeSession.create({
          data: {
            trackerId,
            startTime: new Date(),
          },
        });
      }

      return { success: true, message: "Tracker started." };
    } catch (err) {
      logger.error(`Error starting tracker: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Stop tracking time for a tracker
  async stopTracker(trackerId: string) {
    try {
      // Find the active session
      const activeSession = await prisma.activeSession.findUnique({
        where: { trackerId },
      });

      if (!activeSession) {
        return { success: false, error: "No active session found." };
      }

      const endTime = new Date();
      const durationMinutes = Math.floor(
        (endTime.getTime() - activeSession.startTime.getTime()) / 60000
      );

      // Update tracker's updatedAt timestamp and create session in a transaction
      await prisma.$transaction([
        prisma.tracker.update({
          where: { id: trackerId },
          data: { updatedAt: endTime },
        }),
        prisma.session.create({
          data: {
            trackerId,
            startTime: activeSession.startTime,
            endTime,
            durationMinutes,
          },
        }),
        prisma.activeSession.delete({
          where: { trackerId },
        }),
      ]);

      return {
        success: true,
        message: "Tracker stopped and session recorded.",
      };
    } catch (err) {
      logger.error(`Error stopping tracker: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Archive a tracker
  async archiveTracker(trackerId: string) {
    try {
      await prisma.tracker.update({
        where: { id: trackerId },
        data: { archived: true },
      });

      return { success: true, message: "Tracker archived." };
    } catch (err) {
      logger.error(`Error archiving tracker: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Delete a tracker
  async deleteTracker(trackerId: string) {
    try {
      // Delete related sessions first (should be handled by cascade, but being explicit)
      await prisma.session.deleteMany({
        where: { trackerId },
      });

      // Delete active session if exists
      await prisma.activeSession.deleteMany({
        where: { trackerId },
      });

      // Delete the tracker
      await prisma.tracker.delete({
        where: { id: trackerId },
      });

      return { success: true, message: "Tracker deleted." };
    } catch (err) {
      logger.error(`Error deleting tracker: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Get all trackers for a user
  async getAllTrackers(userId: string) {
    try {
      const trackers = await prisma.tracker.findMany({
        where: { userId },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return { success: true, data: trackers };
    } catch (err) {
      logger.error(`Error getting trackers: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Get all active sessions
  async getAllActiveSessions() {
    try {
      const activeSessions = await prisma.activeSession.findMany({
        include: {
          tracker: true,
        },
      });
      return { success: true, data: activeSessions };
    } catch (err) {
      logger.error(`Error getting active sessions: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Get all sessions for a tracker
  async getSessions(trackerId: string) {
    try {
      const sessions = await prisma.session.findMany({
        where: { trackerId },
      });
      return { success: true, data: sessions };
    } catch (err) {
      logger.error(`Error getting sessions: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },

  // Compute work stats by tracker ID
  async computeWorkStatsByTrackerId(trackerId: string) {
    try {
      // Get the tracker
      const tracker = await prisma.tracker.findUnique({
        where: { id: trackerId },
      });

      if (!tracker) {
        return { success: false, error: "Tracker not found." };
      }

      // Get all sessions for this tracker
      const sessions = await prisma.session.findMany({
        where: { trackerId },
        orderBy: { startTime: "asc" },
      });

      // Helper function to get date string
      const getDateStr = (date: Date) => {
        return date.toISOString().split("T")[0];
      };

      // Calculate daily totals from sessions
      const dailyTotals: Record<string, number> = {};
      for (const session of sessions) {
        const date = getDateStr(session.startTime);
        dailyTotals[date] = (dailyTotals[date] || 0) + session.durationMinutes;
      }

      // Get work days configuration
      const workDays = new Set(tracker.workDays.split(",").map(Number));

      // Calculate all work days from first session to today
      let totalWorkDays = 0;
      let totalWorkHours = 0;

      if (sessions.length > 0) {
        const firstSessionDate = new Date(sessions[0].startTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDate = new Date(firstSessionDate);
        currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= today) {
          const dateStr = getDateStr(currentDate);
          const dayOfWeek = currentDate.getDay();

          if (workDays.has(dayOfWeek)) {
            totalWorkDays++;
            const minutesWorked = dailyTotals[dateStr] || 0;
            totalWorkHours += minutesWorked / 60;
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const targetWorkHours = totalWorkDays * tracker.targetHours;
      let workDebt = 0;
      let workAdvance = 0;

      if (targetWorkHours > totalWorkHours) {
        workDebt = targetWorkHours - totalWorkHours;
      } else {
        workAdvance = totalWorkHours - targetWorkHours;
      }

      const result = {
        workDebt: parseFloat(workDebt.toFixed(2)),
        workAdvance: parseFloat(workAdvance.toFixed(2)),
        totalWorkDays,
        totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
        targetWorkHours: parseFloat(targetWorkHours.toFixed(2)),
      };

      return { success: true, data: result };
    } catch (err) {
      logger.error(`Error computing work stats: ${(err as Error).message}`);
      return { success: false, error: (err as Error).message };
    }
  },
};
