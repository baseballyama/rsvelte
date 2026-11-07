import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import './layout.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		// Sets <body data-theme> based on active route
		// Prevents generator CSS property precedence issues.
		// cerberus
		children?.($$renderer);

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}