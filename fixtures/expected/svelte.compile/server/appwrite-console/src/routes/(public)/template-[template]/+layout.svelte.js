import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { app } from '$lib/stores/app';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		$$renderer.push(`<div class="auth-bg svelte-dsikgi"><section class="console-container svelte-dsikgi">`);
		children($$renderer);
		$$renderer.push(`<!----></section> <footer class="svelte-dsikgi">`);

		if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
			$$renderer.push(`<!--[0--><img${$.attr('src', `${$.stringify(base)}/images/appwrite-logo-dark.svg`)} width="120" height="22" alt="Appwrite Logo"/>`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attr('src', `${$.stringify(base)}/images/appwrite-logo-light.svg`)} width="120" height="22" alt="Appwrite Logo"/>`);
		}

		$$renderer.push(`<!--]--></footer></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}