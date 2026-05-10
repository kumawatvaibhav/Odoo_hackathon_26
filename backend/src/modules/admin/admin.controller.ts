// =============================================================================
// Admin Controller — Request Handlers
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../../utils/response.js";
import * as svc from "./admin.service.js";

// ─── POST /api/admin/login ─────────────────────────────────────────
export const adminLoginHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { sendError(res, 400, { message: "Email and password are required" }); return; }
  if (!svc.verifyAdminCredentials(email, password)) { sendError(res, 401, { message: "Invalid admin credentials" }); return; }
  sendSuccess(res, 200, { message: "Admin authenticated", data: { admin: true, email } });
};

// Users
export const listUsersHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await svc.getUsers({
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
    });
    sendSuccess(res, 200, { data: result });
  } catch (e) { next(e); }
};

// Stats
export const popularCitiesHandler = async (_r: Request, res: Response, next: NextFunction): Promise<void> => {
  try { sendSuccess(res, 200, { data: { cities: await svc.getPopularCities() } }); } catch (e) { next(e); }
};
export const popularActivitiesHandler = async (_r: Request, res: Response, next: NextFunction): Promise<void> => {
  try { sendSuccess(res, 200, { data: { activities: await svc.getPopularActivities() } }); } catch (e) { next(e); }
};
export const trendsHandler = async (_r: Request, res: Response, next: NextFunction): Promise<void> => {
  try { sendSuccess(res, 200, { data: await svc.getUserTrends() }); } catch (e) { next(e); }
};

// ═══ CRUD — Cities ═══
export const getCitiesHandler = async (_r: Request, res: Response, next: NextFunction): Promise<void> => {
  try { sendSuccess(res, 200, { data: { cities: await svc.getAllCities() } }); } catch (e) { next(e); }
};
export const addCityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, country, country_code, latitude, longitude } = req.body;
    if (!name || !country || !country_code) { sendError(res, 400, { message: "name, country, country_code required" }); return; }
    const city = await svc.addCity({ ...req.body, latitude: latitude || 0, longitude: longitude || 0 });
    sendSuccess(res, 201, { data: { city } });
  } catch (e) { next(e); }
};
export const updateCityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const city = await svc.updateCity(req.params.id, req.body);
    sendSuccess(res, 200, { data: { city } });
  } catch (e) { next(e); }
};
export const deleteCityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await svc.deleteCity(req.params.id); sendSuccess(res, 200, { message: "City deleted" }); } catch (e) { next(e); }
};

// ═══ CRUD — Activities ═══
export const getActivitiesHandler = async (_r: Request, res: Response, next: NextFunction): Promise<void> => {
  try { sendSuccess(res, 200, { data: { activities: await svc.getAllActivities() } }); } catch (e) { next(e); }
};
export const addActivityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city_id, name } = req.body;
    if (!city_id || !name) { sendError(res, 400, { message: "city_id and name required" }); return; }
    const activity = await svc.addActivity(req.body);
    sendSuccess(res, 201, { data: { activity } });
  } catch (e) { next(e); }
};
export const updateActivityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activity = await svc.updateActivity(req.params.id, req.body);
    sendSuccess(res, 200, { data: { activity } });
  } catch (e) { next(e); }
};
export const deleteActivityHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await svc.deleteActivity(req.params.id); sendSuccess(res, 200, { message: "Activity deleted" }); } catch (e) { next(e); }
};

// ═══ CRUD — Community Posts ═══
export const getPostsHandler = async (_r: Request, res: Response, next: NextFunction): Promise<void> => {
  try { sendSuccess(res, 200, { data: { posts: await svc.getAllPosts() } }); } catch (e) { next(e); }
};
export const deletePostHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await svc.deletePost(req.params.id); sendSuccess(res, 200, { message: "Post removed" }); } catch (e) { next(e); }
};
export const restorePostHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await svc.restorePost(req.params.id); sendSuccess(res, 200, { message: "Post restored" }); } catch (e) { next(e); }
};
export const toggleFeaturedHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await svc.toggleFeatured(req.params.id); sendSuccess(res, 200, { message: "Toggled featured" }); } catch (e) { next(e); }
};
