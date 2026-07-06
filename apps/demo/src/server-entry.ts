import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server"
import { createServerEntry } from "@tanstack/react-start/server-entry"

const startHandler = createStartHandler(defaultStreamHandler)

// docs.siws.xyz predates the monorepo: keep old deep links alive by redirecting to /docs
export default createServerEntry({
  fetch: (request, opts) => {
    const url = new URL(request.url)
    if (url.hostname === "docs.siws.xyz") {
      return Response.redirect(`https://siws.xyz/docs${url.pathname}${url.search}`, 301)
    }
    return startHandler(request, opts)
  },
})
