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

function createModelDelegate(modelName) {
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
      const { where, orderBy, take, skip, select } = args;
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
      const p = pool.getPool();
      const [rows] = await p.execute(sql, params);

      return rows.map(row => {
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
    },

    async create(args = {}) {
      const { data } = args;
      if (!data) throw new Error('Data argument required for create');

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
      const p = pool.getPool();
      await p.execute(sql, params);

      if (data.id) {
        return this.findUnique({ where: { id: data.id } });
      }
      return data;
    },

    async update(args = {}) {
      const { where, data } = args;
      if (!where || !data) throw new Error('where and data arguments required for update');

      const setClauses = [];
      const params = [];

      for (const [k, v] of Object.entries(data)) {
        if (v === undefined) continue;
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
      const p = pool.getPool();
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

      const setClauses = [];
      const params = [];

      for (const [k, v] of Object.entries(data)) {
        if (v === undefined) continue;
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
      const p = pool.getPool();
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
      const p = pool.getPool();
      const [res] = await p.execute(sql, params);
      return { count: res.affectedRows };
    },

    async count(args = {}) {
      const { where } = args;
      const { clause, params } = buildWhere(where);
      const sql = `SELECT COUNT(*) as total FROM \`${tableName}\` ${clause}`;
      const p = pool.getPool();
      const [rows] = await p.execute(sql, params);
      return parseInt(rows[0]?.total || 0, 10);
    }
  };
}

const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === '$transaction') {
      return async function (arg) {
        if (Array.isArray(arg)) {
          const results = [];
          for (const item of arg) {
            if (typeof item === 'function') {
              results.push(await item());
            } else {
              results.push(await item);
            }
          }
          return results;
        } else if (typeof arg === 'function') {
          return await arg(prisma);
        }
      };
    }
    if (prop === '$queryRaw') {
      return async function (sql, ...params) {
        const p = pool.getPool();
        const [rows] = await p.execute(sql, params);
        return rows;
      };
    }
    if (typeof prop === 'string') {
      return createModelDelegate(prop);
    }
  }
});

export default prisma;
