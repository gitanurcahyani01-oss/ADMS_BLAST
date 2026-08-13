import prisma from '../prisma.js';

/**
 * Helper to extract client IP address
 */
export const getClientIp = (req) => {
  if (!req) return null;
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
};

/**
 * Helper to extract client User-Agent
 */
export const getUserAgent = (req) => {
  if (!req) return null;
  return req.headers['user-agent'] || 'Unknown Client';
};

/**
 * Log an audit action asynchronously without blocking execution
 */
export const logAudit = async ({
  actorId = null,
  targetUserId = null,
  workspaceId = null,
  action,
  module = 'auth',
  details,
  req = null,
}) => {
  try {
    const ipAddress = req ? getClientIp(req) : null;
    const userAgent = req ? getUserAgent(req) : null;

    const log = await prisma.auditLog.create({
      data: {
        actorId,
        targetUserId,
        workspaceId,
        action,
        module,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
        userAgent,
      },
    });

    return log;
  } catch (error) {
    console.error('⚠️ Failed to write audit log:', error.message);
    return null;
  }
};
