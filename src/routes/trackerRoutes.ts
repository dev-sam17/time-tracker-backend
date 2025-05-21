import { Router } from 'express';
import trackerController from '../controllers/trackerController';

const router: Router = Router();

// Tracker routes

router.post('/trackers', trackerController.addTracker);
router.get('/trackers', trackerController.getAllTrackers);
router.post('/trackers/:id/start', trackerController.startTracker);
router.post('/trackers/:id/stop', trackerController.stopTracker);
router.post('/trackers/:id/archive', trackerController.archiveTracker);
router.delete('/trackers/:id', trackerController.deleteTracker);
router.get('/trackers/:id/sessions', trackerController.getSessions);
router.get('/trackers/:id/stats', trackerController.getWorkStats);

// Session routes
router.get('/sessions/active', trackerController.getAllActiveSessions);

export default router;
