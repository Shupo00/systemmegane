[10:29:19.453] Running build in Washington, D.C., USA (East) – iad1
[10:29:19.454] Build machine configuration: 2 cores, 8 GB
[10:29:19.477] Cloning github.com/Shupo00/systemmegane (Branch: main, Commit: 71a870c)
[10:29:19.733] Previous build caches not available
[10:29:22.345] Cloning completed: 2.868s
[10:29:22.746] Running "vercel build"
[10:29:23.167] Vercel CLI 46.0.2
[10:29:23.484] WARNING: You should not upload the `.next` directory.
[10:29:23.491] Installing dependencies...
[10:29:26.022] npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
[10:29:26.283] npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
[10:29:34.522] 
[10:29:34.522] added 116 packages in 11s
[10:29:34.523] 
[10:29:34.523] 22 packages are looking for funding
[10:29:34.524]   run `npm fund` for details
[10:29:34.597] Detected Next.js version: 14.2.32
[10:29:34.600] Running "npm run build"
[10:29:34.714] 
[10:29:34.714] > systemmegane-app@0.2.0 build
[10:29:34.715] > next build
[10:29:34.715] 
[10:29:35.306]  ⚠ Invalid next.config.mjs options detected: 
[10:29:35.307]  ⚠     Unrecognized key(s) in object: 'appDir' at "experimental"
[10:29:35.308]  ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
[10:29:35.314] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[10:29:35.314] This information is used to shape Next.js' roadmap and prioritize features.
[10:29:35.315] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[10:29:35.315] https://nextjs.org/telemetry
[10:29:35.315] 
[10:29:35.371]   ▲ Next.js 14.2.32
[10:29:35.372] 
[10:29:35.433]    Creating an optimized production build ...
[10:29:44.333] Failed to compile.
[10:29:44.333] 
[10:29:44.334] ./app/auth/page.tsx
[10:29:44.334] Module not found: Can't resolve '@/lib/supabase-browser'
[10:29:44.334] 
[10:29:44.334] https://nextjs.org/docs/messages/module-not-found
[10:29:44.334] 
[10:29:44.334] ./app/day/[date]/page.tsx
[10:29:44.334] Module not found: Can't resolve '@/app/components/Modal'
[10:29:44.334] 
[10:29:44.334] https://nextjs.org/docs/messages/module-not-found
[10:29:44.334] 
[10:29:44.334] ./app/api/characters/route.ts
[10:29:44.334] Module not found: Can't resolve '@/lib/supabase-server'
[10:29:44.334] 
[10:29:44.334] https://nextjs.org/docs/messages/module-not-found
[10:29:44.334] 
[10:29:44.335] ./app/api/characters/route.ts
[10:29:44.335] Module not found: Can't resolve '@/lib/repo'
[10:29:44.335] 
[10:29:44.335] https://nextjs.org/docs/messages/module-not-found
[10:29:44.335] 
[10:29:44.335] ./app/api/comment/route.ts
[10:29:44.335] Module not found: Can't resolve '@/lib/repo'
[10:29:44.335] 
[10:29:44.335] https://nextjs.org/docs/messages/module-not-found
[10:29:44.335] 
[10:29:44.359] 
[10:29:44.359] > Build failed because of webpack errors
[10:29:44.389] Error: Command "npm run build" exited with 1