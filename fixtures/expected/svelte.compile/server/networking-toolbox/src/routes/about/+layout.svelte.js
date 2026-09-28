import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import '../../styles/page-specific/about-page.scss';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const isLicensePage = $.derived(() => ($.store_get($$store_subs ??= {}, '$page', page).url?.pathname ?? '/').includes('/license'));

		$$renderer.push(`<main${$.attr_class('card about-content svelte-3yd7a3', void 0, { 'license-page': isLicensePage() })}>`);
		children($$renderer);
		$$renderer.push(`<!----></main>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}