import type { Reroute } from '@sveltejs/kit';
import { langOf, pathWithoutLang } from '$lib/i18n';

// English pages use the Japanese page's route; the page reads the language from the URL.
export const reroute: Reroute = ({ url }) => {
	if (langOf(url.pathname) === 'en') return pathWithoutLang(url.pathname);
};
