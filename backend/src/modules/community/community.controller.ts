// =============================================================================
// Community Controller — Request Handlers
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../../utils/response.js";
import { AppError } from "../../utils/errors.js";
import * as communityService from "./community.service.js";
import type { CommunityQueryParams, CreatePostBody } from "./community.types.js";

// ─── GET /api/community — List / search posts ──────────────────────
export const listPostsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params: CommunityQueryParams = {
      search: req.query.search as string | undefined,
      groupBy: req.query.groupBy as CommunityQueryParams["groupBy"],
      filter: req.query.filter as CommunityQueryParams["filter"],
      sortBy: req.query.sortBy as CommunityQueryParams["sortBy"],
      sortOrder: req.query.sortOrder as CommunityQueryParams["sortOrder"],
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await communityService.getPosts(params);
    sendSuccess(res, 200, { data: result });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/community/:id — Single post ──────────────────────────
export const getPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await communityService.getPostById(req.params.id);
    sendSuccess(res, 200, { data: { post } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/community — Create a new post ──────────────────────
export const createPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const body: CreatePostBody = req.body;

    if (!body.title || !body.title.trim()) {
      sendError(res, 400, { message: "title is required" });
      return;
    }

    const post = await communityService.createPost(userId, body);
    sendSuccess(res, 201, { message: "Post created", data: { post } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/community/:id/like — Toggle like ───────────────────
export const likePostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const result = await communityService.toggleLike(req.params.id, userId);
    sendSuccess(res, 200, {
      message: result.liked ? "Post liked" : "Post unliked",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
