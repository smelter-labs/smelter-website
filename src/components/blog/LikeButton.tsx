import { actions } from "astro:actions";
import { useCallback, useEffect, useState } from "react";
import { localLikeKey } from "./blogHelpers";

export interface LikeButtonProps {
  slug: string;
  /** Smaller, borderless variant used inside post cards. */
  compact?: boolean;
}

const RECAPTCHA_ACTION = "blog_like";

/** Runs reCAPTCHA Enterprise v3 for the like action; empty token when unavailable. */
async function recaptchaToken(): Promise<string | undefined> {
  const siteKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;
  const enterprise = window.grecaptcha?.enterprise;
  if (!siteKey || !enterprise) return undefined;

  return new Promise<string | undefined>((resolve) => {
    enterprise.ready(async () => {
      try {
        resolve(await enterprise.execute(siteKey, { action: RECAPTCHA_ACTION }));
      } catch (error) {
        console.warn("[blog-likes] reCAPTCHA failed", error);
        resolve(undefined);
      }
    });
  });
}

export function LikeButton({ slug, compact = false }: LikeButtonProps) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLiked(window.localStorage.getItem(localLikeKey(slug)) === "1");

    let cancelled = false;
    actions
      .getBlogLikeCount({ slug })
      .then(({ data }) => {
        if (!cancelled) setCount(data?.count ?? 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onClick = useCallback(async () => {
    if (liked || pending) return;

    setPending(true);
    // Optimistic: the count moves now, the server reconciles it below.
    setLiked(true);
    setCount((current) => (current ?? 0) + 1);
    window.localStorage.setItem(localLikeKey(slug), "1");

    try {
      const token = await recaptchaToken();
      const { data, error } = await actions.likeBlogPost({ slug, recaptchaToken: token });

      if (error || !data) throw error ?? new Error("no data");

      if (!data.enabled) {
        console.warn("[blog-likes] likes are not configured on this deployment");
      }
      if (!data.liked) throw new Error("like was not recorded");

      setCount(data.count);
    } catch (error) {
      console.warn("[blog-likes] like failed", error);
      // Roll back — nothing was counted.
      setLiked(false);
      setCount((current) => Math.max(0, (current ?? 1) - 1));
      window.localStorage.removeItem(localLikeKey(slug));
    } finally {
      setPending(false);
    }
  }, [liked, pending, slug]);

  const size = compact ? "h-7 gap-1.5 px-2 text-[11px]" : "h-8 gap-2 px-3 text-xs";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={liked || pending}
      aria-pressed={liked}
      aria-label={liked ? "You liked this post" : "Like this post"}
      title={liked ? "You liked this post" : "Like this post"}
      className={`inline-flex items-center rounded-full border border-homeLicense-border transition-colors duration-200 ${size} ${
        liked
          ? "cursor-default text-[#F24664]"
          : "text-hero-subtitle hover:border-white/40 hover:text-white"
      }`}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={compact ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M12 20.5 3.9 12.4a5.1 5.1 0 0 1 7.2-7.2l.9.9.9-.9a5.1 5.1 0 0 1 7.2 7.2z" />
      </svg>
      <span
        className="tabular-nums"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
        }}>
        {count ?? "—"}
      </span>
    </button>
  );
}

export default LikeButton;
