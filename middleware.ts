// import { Redis } from '@upstash/redis';
// import { NextResponse } from 'next/server';

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_URL!,
//   token: process.env.UPSTASH_REDIS_TOKEN!,
// });

// export default async function middleware(req: Request) {
//   const response = NextResponse.next();
//   const time = Date.now();
//   const timeStr = new Date(time).toLocaleString();
//   response.headers.set('x-time', timeStr);

//   const logData = {
//     time: timeStr,
//     protocol: req.headers.get('x-forwarded-proto'),
//     host: req.headers.get('host'),
//     url: req.url,
//     method: req.method,
//   };
//   redis.lpush('request-logs:', logData);

//   return response;
// }
