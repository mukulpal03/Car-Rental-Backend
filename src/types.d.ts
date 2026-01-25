export declare global {
  namespace Express {
    interface Request {
      user?: any; // Make it optional in case some routes don't require authentication
    }
  }
}
