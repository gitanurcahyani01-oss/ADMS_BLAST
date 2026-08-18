import crypto from 'crypto';
import pool from './db.js';

// Mapping camelCase model names to MySQL table names
const TABLE_MAP = {
  user: 'users',
  role: 'roles',
  permission: 'permissions',
  rolePermission: 'role_permissions',
  userRole: 'user_roles',
  workspace: 'workspaces',
  workspaceUser: 'workspace_users',
  subscriptionPlan: 'subscription_plans',
  subscription: 'subscriptions',
  contact: 'contacts',
  contactList: 'contact_lists',
  contactListRelation: 'contact_list_relations',
  autoReplyRule: 'auto_reply_rules',
  auditLog: 'audit_logs',
  device: 'devices',
  blastCampaign: 'blast_campaigns',
  blastLog: 'blast_logs',
  referralReward: 'referral_rewards',
  payoutRequest: 'payout_requests'
};

const MODELS_WITH_CREATED_AT = new Set([
  'user', 'role', 'permission', 'rolePermission', 'userRole',
  'workspace', 'workspaceUser', 'subscriptionPlan', 'subscription',
  'contact', 'contactList', 'contactListRelation', 'autoReplyRule',
  'auditLog', 'device', 'blastCampaign', 'referralReward', 'payoutRequest'
]);

const MODELS_WITH_UPDATED_AT = new Set([
  'user', 'role', 'workspace', 'workspaceUser', 'subscriptionPlan',
  'subscription', 'contact', 'contactList', 'autoReplyRule',
  'device', 'blastCampaign', 'referralReward'
]);

function getTableName(model) {
  return TABLE_MAP[model] || model.toLowerCase() + 's';
}

function buildWhere(whereObj) {
  if (!whereObj || Object.keys(whereObj).length === 0) {
    return { clause: '', params: [] };
  }
  const conditions = [];
  const params = [];

  for (const [key, val] of Object.entries(whereObj)) {
    if (val === undefined) continue;

    // Handle OR / AND logical operators
    if ((key === 'OR' || key === 'AND') && Array.isArray(val)) {
      if (val.length === 0) continue;
      const subClauses = [];
      for (const item of val) {
        const { clause: subClause, params: subParams } = buildWhere(item);
        if (subClause) {
          const subClauseClean = subClause.startsWith('WHERE ') ? subClause.slice(6) : subClause;
          subClauses.push(`(${subClauseClean})`);
          params.push(...subParams);
        }
      }
      if (subClauses.length > 0) {
        conditions.push(`(${subClauses.join(` ${key} `)})`);
      }
      continue;
    }

    // Handle composite unique key objects e.g. { roleId_permissionId: { roleId, permissionId } }
    if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date) && !('in' in val || 'contains' in val || 'startsWith' in val || 'gte' in val || 'lte' in val || 'gt' in val || 'lt' in val || 'not' in val)) {
      for (const [subKey, subVal] of Object.entries(val)) {
        if (subVal === null) {
          conditions.push(`\`${subKey}\` IS NULL`);
        } else {
          conditions.push(`\`${subKey}\` = ?`);
          params.push(subVal);
        }
      }
      continue;
    }

    if (val === null) {
      conditions.push(`\`${key}\` IS NULL`);
    } else if (typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if ('in' in val && Array.isArray(val.in)) {
        if (val.in.length === 0) {
          conditions.push('1 = 0');
        } else {
          conditions.push(`\`${key}\` IN (${val.in.map(() => '?').join(',')})`);
          params.push(...val.in);
        }
      } else if ('not' in val) {
        if (val.not === null) {
          conditions.push(`\`${key}\` IS NOT NULL`);
        } else {
          conditions.push(`\`${key}\` != ?`);
          params.push(val.not);
        }
      } else if ('contains' in val) {
        conditions.push(`\`${key}\` LIKE ?`);
        params.push(`%${val.contains}%`);
      } else if ('startsWith' in val) {
        conditions.push(`\`${key}\` LIKE ?`);
        params.push(`${val.startsWith}%`);
      } else if ('gte' in val) {
        conditions.push(`\`${key}\` >= ?`);
        params.push(val.gte);
      } else if ('lte' in val) {
        conditions.push(`\`${key}\` <= ?`);
        params.push(val.lte);
      } else if ('gt' in val) {
        conditions.push(`\`${key}\` > ?`);
        params.push(val.gt);
      } else if ('lt' in val) {
        conditions.push(`\`${key}\` < ?`);
        params.push(val.lt);
      }
    } else {
      conditions.push(`\`${key}\` = ?`);
      params.push(val);
    }
  }

  return {
    clause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
}

// Mapping relations for Prisma-like `include` queries
const RELATION_MAP = {
  user: {
    workspaceMembers: { model: 'workspaceUser', foreignKey: 'userId', relationType: 'many' },
    ownedWorkspaces: { model: 'workspace', foreignKey: 'ownerId', relationType: 'many' },
    userRoles: { model: 'userRole', foreignKey: 'userId', relationType: 'many' }
  },
  workspaceUser: {
    workspace: { model: 'workspace', foreignKey: 'id', localKey: 'workspaceId', relationType: 'one' },
    user: { model: 'user', foreignKey: 'id', localKey: 'userId', relationType: 'one' }
  },
  workspace: {
    subscription: { model: 'subscription', foreignKey: 'workspaceId', relationType: 'one' },
    owner: { model: 'user', foreignKey: 'id', localKey: 'ownerId', relationType: 'one' },
    devices: { model: 'device', foreignKey: 'workspaceId', relationType: 'many' },
    campaigns: { model: 'blastCampaign', foreignKey: 'workspaceId', relationType: 'many' },
    contacts: { model: 'contact', foreignKey: 'workspaceId', relationType: 'many' },
    contactLists: { model: 'contactList', foreignKey: 'workspaceId', relationType: 'many' },
    autoReplyRules: { model: 'autoReplyRule', foreignKey: 'workspaceId', relationType: 'many' }
  },
  subscription: {
    workspace: { model: 'workspace', foreignKey: 'id', localKey: 'workspaceId', relationType: 'one' },
    plan: { model: 'subscriptionPlan', foreignKey: 'id', localKey: 'planId', relationType: 'one' }
  },
  userRole: {
    role: { model: 'role', foreignKey: 'id', localKey: 'roleId', relationType: 'one' },
    user: { model: 'user', foreignKey: 'id', localKey: 'userId', relationType: 'one' }
  },
  role: {
    permissions: { model: 'rolePermission', foreignKey: 'roleId', relationType: 'many' }
  },
  rolePermission: {
    permission: { model: 'permission', foreignKey: 'id', localKey: 'permissionId', relationType: 'one' }
  },
  blastCampaign: {
    device: { model: 'device', foreignKey: 'id', localKey: 'deviceId', relationType: 'one' },
    createdBy: { model: 'user', foreignKey: 'id', localKey: 'createdById', relationType: 'one' },
    workspace: { model: 'workspace', foreignKey: 'id', localKey: 'workspaceId', relationType: 'one' },
    logs: { model: 'blastLog', foreignKey: 'campaignId', relationType: 'many' }
  },
  blastLog: {
    campaign: { model: 'blastCampaign', foreignKey: 'id', localKey: 'campaignId', relationType: 'one' }
  },
  device: {
    workspace: { model: 'workspace', foreignKey: 'id', localKey: 'workspaceId', relationType: 'one' }
  },
  contact: {
    workspace: { model: 'workspace', foreignKey: 'id', localKey: 'workspaceId', relationType: 'one' },
    listMembers: { model: 'contactListRelation', foreignKey: 'contactId', relationType: 'many' }
  },
  contactListRelation: {
    contact: { model: 'contact', foreignKey: 'id', localKey: 'contactId', relationType: 'one' },
    list: { model: 'contactList', foreignKey: 'id', localKey: 'listId', relationType: 'one' }
  },
  contactList: {
    contacts: { model: 'contactListRelation', foreignKey: 'listId', relationType: 'many' }
  },
  referralReward: {
    referrer: { model: 'user', foreignKey: 'id', localKey: 'referrerId', relationType: 'one' },
    referredUser: { model: 'user', foreignKey: 'id', localKey: 'referredUserId', relationType: 'one' }
  },
  payoutRequest: {
    user: { model: 'user', foreignKey: 'id', localKey: 'userId', relationType: 'one' }
  }
};

async function resolveIncludes(modelName, rows, include, conn = null) {
  if (!include || !rows || rows.length === 0) return;

  const modelRelations = RELATION_MAP[modelName];
  if (!modelRelations) return;

  for (const [relationName, relationIncludeVal] of Object.entries(include)) {
    if (!relationIncludeVal) continue;

    const relConfig = modelRelations[relationName];
    if (!relConfig) continue;

    const { model, foreignKey, localKey = 'id', relationType } = relConfig;

    for (const row of rows) {
      const keyValue = row[localKey];
      if (keyValue === undefined || keyValue === null) {
        row[relationName] = relationType === 'many' ? [] : null;
        continue;
      }

      const delegate = createModelDelegate(model, conn);

      const queryArgs = {
        where: { [foreignKey]: keyValue }
      };
      if (typeof relationIncludeVal === 'object' && relationIncludeVal.select) {
        queryArgs.select = relationIncludeVal.select;
      }

      if (relationType === 'many') {
        const relatedRows = await delegate.findMany(queryArgs);
        if (typeof relationIncludeVal === 'object' && relationIncludeVal.include) {
          await resolveIncludes(model, relatedRows, relationIncludeVal.include, conn);
        }
        row[relationName] = relatedRows;
      } else {
        const relatedRow = await delegate.findFirst(queryArgs);
        if (relatedRow && typeof relationIncludeVal === 'object' && relationIncludeVal.include) {
          await resolveIncludes(model, [relatedRow], relationIncludeVal.include, conn);
        }
        row[relationName] = relatedRow;
      }
    }
  }
}

function createModelDelegate(modelName, conn = null) {
  const tableName = getTableName(modelName);

  return {
    async findUnique(args = {}) {
      return this.findFirst(args);
    },

    async findFirst(args = {}) {
      const rows = await this.findMany({ ...args, take: 1 });
      return rows[0] || null;
    },

    async findMany(args = {}) {
      const { where, orderBy, take, skip, select, include } = args;
      const { clause, params } = buildWhere(where);

      let selectClause = '*';
      if (select && Object.keys(select).length > 0) {
        const fields = Object.keys(select).filter(f => select[f]);
        if (fields.length > 0) {
          selectClause = fields.map(f => `\`${f}\``).join(', ');
        }
      }

      let orderClause = '';
      if (orderBy) {
        if (typeof orderBy === 'object' && !Array.isArray(orderBy)) {
          const orderEntries = Object.entries(orderBy);
          if (orderEntries.length > 0) {
            orderClause = 'ORDER BY ' + orderEntries.map(([f, dir]) => `\`${f}\` ${dir.toUpperCase()}`).join(', ');
          }
        }
      }

      let limitClause = '';
      if (take !== undefined) {
        const limit = parseInt(take, 10);
        const offset = skip ? parseInt(skip, 10) : 0;
        limitClause = `LIMIT ${offset}, ${limit}`;
      }

      const sql = `SELECT ${selectClause} FROM \`${tableName}\` ${clause} ${orderClause} ${limitClause}`.trim();
      const p = conn || pool.getPool();
      const [rows] = await p.execute(sql, params);

      const formattedRows = rows.map(row => {
        const formatted = { ...row };
        for (const [k, v] of Object.entries(formatted)) {
          if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
            try {
              formatted[k] = JSON.parse(v);
            } catch (e) {}
          }
        }
        return formatted;
      });

      if (include) {
        await resolveIncludes(modelName, formattedRows, include, conn);
      }

      return formattedRows;
    },

    async create(args = {}) {
      const { data } = args;
      if (!data) throw new Error('Data argument required for create');

      const compositeModels = ['rolePermission', 'userRole', 'contactListRelation'];
      if (!data.id && !compositeModels.includes(modelName)) {
        data.id = crypto.randomUUID();
      }

      if (MODELS_WITH_CREATED_AT.has(modelName) && data.createdAt === undefined) {
        data.createdAt = new Date();
      }
      if (MODELS_WITH_UPDATED_AT.has(modelName) && data.updatedAt === undefined) {
        data.updatedAt = new Date();
      }

      const keys = [];
      const placeholders = [];
      const params = [];

      for (const [k, v] of Object.entries(data)) {
        if (v === undefined) continue;
        keys.push(`\`${k}\``);
        placeholders.push('?');
        if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
          params.push(JSON.stringify(v));
        } else {
          params.push(v);
        }
      }

      const sql = `INSERT INTO \`${tableName}\` (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`;
      const p = conn || pool.getPool();
      await p.execute(sql, params);

      if (data.id) {
        return this.findUnique({ where: { id: data.id } });
      }
      return data;
    },

    async createMany(args = {}) {
      const { data } = args;
      if (!data) throw new Error('Data argument required for createMany');
      const dataArray = Array.isArray(data) ? data : [data];
      if (dataArray.length === 0) return { count: 0 };

      const compositeModels = ['rolePermission', 'userRole', 'contactListRelation'];

      const allKeysSet = new Set();
      for (const row of dataArray) {
        if (!row.id && !compositeModels.includes(modelName)) {
          row.id = crypto.randomUUID();
        }
        if (MODELS_WITH_CREATED_AT.has(modelName) && row.createdAt === undefined) {
          row.createdAt = new Date();
        }
        if (MODELS_WITH_UPDATED_AT.has(modelName) && row.updatedAt === undefined) {
          row.updatedAt = new Date();
        }
        for (const k of Object.keys(row)) {
          if (row[k] !== undefined) {
            allKeysSet.add(k);
          }
        }
      }
      const keys = Array.from(allKeysSet);
      const keysStr = keys.map(k => `\`${k}\``).join(', ');

      const placeholders = [];
      const params = [];

      for (const row of dataArray) {
        const rowPlaceholders = [];
        for (const k of keys) {
          const v = row[k];
          rowPlaceholders.push('?');
          if (v === undefined || v === null) {
            params.push(null);
          } else if (typeof v === 'object' && !(v instanceof Date)) {
            params.push(JSON.stringify(v));
          } else {
            params.push(v);
          }
        }
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
      }

      const sql = `INSERT INTO \`${tableName}\` (${keysStr}) VALUES ${placeholders.join(', ')}`;
      const p = conn || pool.getPool();
      const [res] = await p.execute(sql, params);
      return { count: res.affectedRows };
    },

    async update(args = {}) {
      const { where, data } = args;
      if (!where || !data) throw new Error('where and data arguments required for update');

      if (MODELS_WITH_UPDATED_AT.has(modelName) && data.updatedAt === undefined) {
        data.updatedAt = new Date();
      }

      const setClauses = [];
      const params = [];

      for (const [k, v] of Object.entries(data)) {
        if (v === undefined) continue;

        if (v !== null && typeof v === 'object' && 'increment' in v) {
          setClauses.push(`\`${k}\` = \`${k}\` + ?`);
          params.push(v.increment);
          continue;
        }

        setClauses.push(`\`${k}\` = ?`);
        if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
          params.push(JSON.stringify(v));
        } else {
          params.push(v);
        }
      }

      const { clause, params: whereParams } = buildWhere(where);
      params.push(...whereParams);

      const sql = `UPDATE \`${tableName}\` SET ${setClauses.join(', ')} ${clause}`;
      const p = conn || pool.getPool();
      await p.execute(sql, params);

      return this.findFirst({ where });
    },

    async upsert(args = {}) {
      const { where, update, create } = args;
      const existing = await this.findFirst({ where });
      if (existing) {
        if (Object.keys(update || {}).length === 0) return existing;
        return this.update({ where, data: update });
      }
      return this.create({ data: create });
    },

    async updateMany(args = {}) {
      const { where, data } = args;
      if (!data) throw new Error('data argument required for updateMany');

      if (MODELS_WITH_UPDATED_AT.has(modelName) && data.updatedAt === undefined) {
        data.updatedAt = new Date();
      }

      const setClauses = [];
      const params = [];

      for (const [k, v] of Object.entries(data)) {
        if (v === undefined) continue;

        if (v !== null && typeof v === 'object' && 'increment' in v) {
          setClauses.push(`\`${k}\` = \`${k}\` + ?`);
          params.push(v.increment);
          continue;
        }

        setClauses.push(`\`${k}\` = ?`);
        if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
          params.push(JSON.stringify(v));
        } else {
          params.push(v);
        }
      }

      const { clause, params: whereParams } = buildWhere(where);
      params.push(...whereParams);

      const sql = `UPDATE \`${tableName}\` SET ${setClauses.join(', ')} ${clause}`;
      const p = conn || pool.getPool();
      const [res] = await p.execute(sql, params);
      return { count: res.affectedRows };
    },

    async delete(args = {}) {
      const { where } = args;
      const record = await this.findFirst({ where });
      await this.deleteMany({ where });
      return record;
    },

    async deleteMany(args = {}) {
      const { where } = args;
      const { clause, params } = buildWhere(where);
      const sql = `DELETE FROM \`${tableName}\` ${clause}`;
      const p = conn || pool.getPool();
      const [res] = await p.execute(sql, params);
      return { count: res.affectedRows };
    },

    async count(args = {}) {
      const { where } = args;
      const { clause, params } = buildWhere(where);
      const sql = `SELECT COUNT(*) as total FROM \`${tableName}\` ${clause}`;
      const p = conn || pool.getPool();
      const [rows] = await p.execute(sql, params);
      return parseInt(rows[0]?.total || 0, 10);
    }
  };
}

function createPrismaClient(conn = null) {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === '$transaction') {
        return async function (arg) {
          if (conn) {
            if (typeof arg === 'function') {
              return await arg(this);
            }
            if (Array.isArray(arg)) {
              const results = [];
              for (const item of arg) {
                results.push(await item);
              }
              return results;
            }
          }

          const pPool = pool.getPool();
          const connection = await pPool.getConnection();
          try {
            await connection.beginTransaction();
            const txClient = createPrismaClient(connection);
            let result;
            if (Array.isArray(arg)) {
              const results = [];
              for (const item of arg) {
                results.push(await item);
              }
              result = results;
            } else if (typeof arg === 'function') {
              result = await arg(txClient);
            }
            await connection.commit();
            return result;
          } catch (e) {
            await connection.rollback();
            throw e;
          } finally {
            connection.release();
          }
        };
      }
      if (prop === '$queryRaw') {
        return async function (sql, ...params) {
          const p = conn || pool.getPool();
          const [rows] = await p.execute(sql, params);
          return rows;
        };
      }
      if (typeof prop === 'string') {
        return createModelDelegate(prop, conn);
      }
    }
  });
}

const prisma = createPrismaClient();

export default prisma;
