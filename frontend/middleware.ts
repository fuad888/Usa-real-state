import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Detects the browser language on first visit, then honours the manual
// switcher via the NEXT_LOCALE cookie (spec §7).
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|demo|vendor|.*\\..*).*)",
};
