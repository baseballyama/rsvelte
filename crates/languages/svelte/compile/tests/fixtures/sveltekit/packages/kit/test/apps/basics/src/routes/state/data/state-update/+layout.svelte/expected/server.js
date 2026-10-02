import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { untrack } from 'svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let previous = page.data;
		let count = 0;

		$$renderer.push(`<p>page.data was updated ${$.escape(count)} time(s)</p> <a href="/state/data/state-update/a">a</a> <a href="/state/data/state-update/b">b</a> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}