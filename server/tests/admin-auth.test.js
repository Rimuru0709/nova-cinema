import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import express from 'express';
import authRoutes from '../src/routes/auth.js';
import pool from '../src/config/db.js';

test('Đăng nhập, phân quyền admin và hủy phiên bằng MySQL', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/auth`;
  const email = `admin-test-${randomUUID()}@example.invalid`;
  const password = randomUUID() + '!';
  let userId;
  async function request(path, body, cookie) {
    const response = await fetch(base + path, {
      method: body ? 'POST' : 'GET',
      headers: { ...(body && { 'Content-Type': 'application/json' }), ...(cookie && { Cookie: cookie }) },
      ...(body && { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  try {
    assert.equal((await request('/admin/session')).status, 401);
    // A public registration request cannot grant itself administrator privileges.
    assert.equal((await request('/register', { fullName: 'Admin integration test', email, password, role: 'admin' })).status, 201);
    const [users] = await pool.execute('SELECT id, role FROM users WHERE email = ?', [email]);
    userId = users[0].id;
    assert.equal(users[0].role, 'user');
    assert.equal((await request('/login', { account: email, password: 'incorrect' })).status, 401);
    const customer = await request('/login', { account: email, password });
    assert.equal(customer.status, 200);
    assert.equal(customer.body.user.role, 'user');
    assert.equal((await request('/admin/session', null, customer.cookie)).status, 403);
    assert.equal((await request('/admin/users', null, customer.cookie)).status, 403);

    await pool.execute("UPDATE users SET role = 'admin' WHERE id = ?", [userId]);
    const admin = await request('/login', { account: email, password });
    assert.equal(admin.body.user.role, 'admin');
    const access = await request('/admin/session', null, admin.cookie);
    assert.equal(access.status, 200);
    assert.equal(access.body.user.email, email);
    assert.equal(Object.hasOwn(access.body.user, 'password_hash'), false);

    await pool.execute("UPDATE users SET role = 'user' WHERE id = ?", [userId]);
    assert.equal((await request('/admin/session', null, admin.cookie)).status, 403);
    await pool.execute("UPDATE users SET role = 'admin', status = 'disabled' WHERE id = ?", [userId]);
    assert.equal((await request('/admin/session', null, admin.cookie)).status, 401);
    assert.equal((await request('/login', { account: email, password })).status, 401);
    await pool.execute("UPDATE users SET status = 'active' WHERE id = ?", [userId]);
    await pool.execute('UPDATE auth_sessions SET expires_at = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 SECOND) WHERE user_id = ?', [userId]);
    assert.equal((await request('/admin/session', null, admin.cookie)).status, 401);

    const next = await request('/login', { account: email, password });
    assert.equal((await request('/admin/session', null, next.cookie)).status, 200);
    assert.equal((await request('/logout', {}, next.cookie)).status, 200);
    assert.equal((await request('/admin/session', null, next.cookie)).status, 401);
  } finally {
    // Only remove the uniquely named account created by this test; sessions cascade.
    if (userId) await pool.execute('DELETE FROM users WHERE id = ? AND email = ?', [userId, email]);
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
