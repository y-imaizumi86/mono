// src/middleware.ts

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Cloudflare Access の JWT からメールアドレスを取得
  const jwtToken = context.request.headers.get('Cf-Access-Jwt-Assertion');

  if (jwtToken) {
    try {
      // JWT のペイロード部分をデコード（署名検証はCloudflare Accessが済ませている）
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      context.locals.userEmail = payload.email;
    } catch {
      // デコード失敗時は無視
    }
  }

  // ローカル開発用: Cloudflare Access がない場合のフォールバック
  if (!context.locals.userEmail && import.meta.env.DEV) {
    context.locals.userEmail = 'dev@example.com';
  }

  return next();
});
