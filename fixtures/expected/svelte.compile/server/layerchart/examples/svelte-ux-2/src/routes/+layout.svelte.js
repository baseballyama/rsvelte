import * as $ from 'svelte/internal/server';
import { settings, ThemeInit, ThemeSwitch } from 'svelte-ux';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		settings();

		let { children } = $$props;

		$.head('1smimic', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
		});

		ThemeInit($$renderer, {});
		$$renderer.push(`<!----> <main class="p-4"><div class="pb-4 text-right">`);
		ThemeSwitch($$renderer, {});
		$$renderer.push(`<!----></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}