import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('Main public/account/TV4 routes render without crashing; admin navigation exposes TV4 screens', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  const original = globalThis.window;
  globalThis.window = { location: { hash: '', search: '' }, sessionStorage: { getItem: () => null }, localStorage: { getItem: () => null } };
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
    for (const hash of ['#trang-chu', '#phim', '#chi-tiet/dune', '#lich-chieu', '#chon-ghe/1', '#dang-nhap', '#dang-ky', '#tai-khoan', '#chon-combo', '#thanh-toan', '#xac-nhan-dat-ve/NC-TEST', '#ve-cua-toi', '#admin']) {
      window.location.hash = hash;
      const html = renderToStaticMarkup(React.createElement(App));
      assert.ok(html.length > 100, `Empty render: ${hash}`);
    }
    const { default: AdminPage } = await vite.ssrLoadModule('/src/admin/AdminPage.jsx');
    for (const code of ['ad01', 'ad05', 'ad06']) {
      window.location.hash = '#admin/' + code;
      const html = renderToStaticMarkup(React.createElement(AdminPage, { user: { fullName: 'Kiểm thử' } }));
      assert.ok(html.includes(`href="#admin/${code}"`));
      assert.match(html, /aria-current="page"/);
      assert.doesNotMatch(html, /GIAO DỊCH MẪU|DEMO_TODAY/);
    }
  } finally {
    if (original === undefined) delete globalThis.window; else globalThis.window = original;
    await vite.close();
  }
});
