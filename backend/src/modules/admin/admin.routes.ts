// =============================================================================
// Admin Routes
// =============================================================================

import { Router } from "express";
import * as ctrl from "./admin.controller.js";

const router = Router();

// Auth
router.post("/login", ctrl.adminLoginHandler);

// Users
router.get("/users", ctrl.listUsersHandler);

// Stats
router.get("/stats/cities", ctrl.popularCitiesHandler);
router.get("/stats/activities", ctrl.popularActivitiesHandler);
router.get("/stats/trends", ctrl.trendsHandler);

// CRUD — Cities
router.get("/cities", ctrl.getCitiesHandler);
router.post("/cities", ctrl.addCityHandler);
router.put("/cities/:id", ctrl.updateCityHandler);
router.delete("/cities/:id", ctrl.deleteCityHandler);

// CRUD — Activities
router.get("/activities", ctrl.getActivitiesHandler);
router.post("/activities", ctrl.addActivityHandler);
router.put("/activities/:id", ctrl.updateActivityHandler);
router.delete("/activities/:id", ctrl.deleteActivityHandler);

// CRUD — Community Posts
router.get("/posts", ctrl.getPostsHandler);
router.delete("/posts/:id", ctrl.deletePostHandler);
router.post("/posts/:id/restore", ctrl.restorePostHandler);
router.post("/posts/:id/feature", ctrl.toggleFeaturedHandler);

export default router;
