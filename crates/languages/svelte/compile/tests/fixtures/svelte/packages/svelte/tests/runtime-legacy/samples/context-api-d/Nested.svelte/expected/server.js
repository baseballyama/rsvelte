import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function Nested($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext('a', 1);
		setContext('b', 2);
		setContext('c', 3);
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}