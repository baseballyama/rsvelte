import * as $ from 'svelte/internal/server';
import noFrameworkIcon from './noFrameworkIcon.svg';
import noFrameworkIconDark from './noFrameworkIconDark.svg';
import { app } from '$lib/stores/app';

export default function NoFrameworkIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'light') {
			$$renderer.push(`<!--[0--><img${$.attr('src', noFrameworkIcon)} alt=""/>`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attr('src', noFrameworkIconDark)} alt=""/>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}