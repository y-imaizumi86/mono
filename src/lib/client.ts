// src/lib/client.ts

import { hc } from 'hono/client'
import type { AppType } from '@/server'

// Hono RPC Client
// URLはデプロイ環境に合わせて書き換わるようにwindow.locationを使うか、相対パスで指定
export const client = hc<AppType>('/')