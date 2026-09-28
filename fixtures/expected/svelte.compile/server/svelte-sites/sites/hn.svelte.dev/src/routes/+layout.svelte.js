import * as $ from 'svelte/internal/server';
import { page, navigating } from '$app/state';
import Nav from '$lib/Nav.svelte';
import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
import ThemeToggler from '$lib/ThemeToggler.svelte';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;
		const section = $.derived(() => page.url.pathname.split('/')[1]);

		Nav($$renderer, { section: section() });
		$$renderer.push(`<!----> `);

		if (navigating.from) {
			$$renderer.push('<!--[0-->');
			PreloadingIndicator($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <main class="svelte-ugx4i7">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		ThemeToggler($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}