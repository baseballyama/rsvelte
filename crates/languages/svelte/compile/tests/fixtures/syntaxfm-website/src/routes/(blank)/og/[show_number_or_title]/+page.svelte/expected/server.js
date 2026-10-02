import * as $ from 'svelte/internal/server';
import ShowOg from './ShowOg.svelte';

export default function _page($$renderer, $$props) {
	let { data } = $$props;
	let show = $.derived(() => data.show);

	// This sucks but the type error made no sense.
	// Was using the exact query to generate the type
	let show_casted = $.derived(show);

	if (show()) {
		$$renderer.push(`<!--[0--><div class="og-container svelte-1xzslwa">`);
		ShowOg($$renderer, { show: show_casted() });
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}