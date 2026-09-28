import * as $ from 'svelte/internal/server';
import { colorMode, toggleColorMode } from './helpers';

export default function ThemeToggler($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let currentColorMode = $.store_get($$store_subs ??= {}, '$colorMode', colorMode);

		colorMode.subscribe((value) => {
			currentColorMode = value;
		});

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', { currentColorMode, toggleColorMode }, null);
		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}