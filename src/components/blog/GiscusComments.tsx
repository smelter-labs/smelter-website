import { useEffect, useRef } from "react";

export interface GiscusCommentsProps {
  /** `owner/name` of the repo holding the Discussions. */
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  /** Discussion mapped to the post, e.g. `/blog/my-post`. */
  term: string;
}

/**
 * Giscus embed loaded through the official client script — same widget as
 * `@giscus/react`, without pulling in another dependency. Mounted with
 * `client:visible` so it never competes with the article for LCP.
 */
export function GiscusComments({ repo, repoId, category, categoryId, term }: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "noborder_dark");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");

    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [repo, repoId, category, categoryId, term]);

  return <div ref={containerRef} className="giscus" />;
}

export default GiscusComments;
