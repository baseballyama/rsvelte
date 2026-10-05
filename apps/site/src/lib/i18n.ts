// The URL path is the only source of the reader's language, so a reload, a shared link and the server
// render always agree. Japanese keeps the original paths; English adds the `/en` prefix.

export type Lang = 'ja' | 'en';

export const langs: readonly Lang[] = ['ja', 'en'];

const PREFIX = '/en';

export function langOf(pathname: string): Lang {
	return pathname === PREFIX || pathname.startsWith(`${PREFIX}/`) ? 'en' : 'ja';
}

/** The route path shared by both languages: `/en/learn` and `/learn` both give `/learn`. */
export function pathWithoutLang(pathname: string): string {
	return langOf(pathname) === 'en' ? pathname.slice(PREFIX.length) || '/' : pathname;
}

/** `path` must be a site path in the shared form (`/learn/kernel#overview`). */
export function localizedPath(path: string, lang: Lang): string {
	if (lang === 'ja') return path;
	return path === '/' || /^\/[#?]/.test(path) ? PREFIX + path.slice(1) : PREFIX + path;
}

/**
 * The path of the current page in `lang`. The header renders on any path, including a 404 such as
 * `/en//evil.example`; a shared path that starts with `//` or `/\` would be a link to another host, so it becomes `/`.
 */
export function switchPath(pathname: string, lang: Lang): string {
	const route = pathWithoutLang(pathname);
	return localizedPath(/^\/[^/\\]|^\/$/.test(route) ? route : '/', lang);
}

export function switchHref(location: { pathname: string; search: string; hash: string }, lang: Lang): string {
	return switchPath(location.pathname, lang) + location.search + location.hash;
}

/**
 * Text in both languages. The English value must have the Japanese value's shape, so a missing key fails
 * the type check. The English prose check reads the second argument; the Japanese check reads the first.
 */
export function bilingual<T>(ja: T, en: NoInfer<T>): Record<Lang, T> {
	return { ja, en };
}
