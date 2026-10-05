import { page } from '$app/state';
import { langOf, type Lang } from './i18n';

/** The language of the page being shown. Call it inside `$derived` or markup so it follows navigation. */
export function readerLang(): Lang {
	return langOf(page.url.pathname);
}
