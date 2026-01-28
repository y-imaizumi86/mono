// src/pages/api/[...route].ts

import type { APIRoute } from 'astro';
import app from '@/server';

// ハンドラー関数
const handler: APIRoute = async (context) => {
  // Cloudflareの環境変数（DBなど）を取得
  const env = context.locals.runtime.env;

  // HonoにRequestとEnvを渡して実行
  return app.fetch(context.request, env);
};

// 全てのHTTPメソッドでこのハンドラーを使う
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
