import * as $ from 'svelte/internal/server';
import { LocaleProviderRootContext } from '../modules/root-context.js';
import { isRTL } from '@zag-js/i18n-utils';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const children = $.derived(() => props.children),
			locale = $.derived(() => props.locale);

		LocaleProviderRootContext.provide(() => ({ locale: locale(), dir: isRTL(locale()) ? 'rtl' : 'ltr' }));
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}