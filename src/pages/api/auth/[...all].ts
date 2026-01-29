// src/pages/api/auth/[...all].ts

import { createAuth } from '../../../lib/auth';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = async (context) => {
  // 1. Cloudflareの環境変数を取得
  const env = context.locals.runtime.env;

  // 2. Authインスタンスを作成
  const auth = createAuth(env);

  // 3. リクエストをBetter Authに処理させる
  return auth.handler(context.request);
};
