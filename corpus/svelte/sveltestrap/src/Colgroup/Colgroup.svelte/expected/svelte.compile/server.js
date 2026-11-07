import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function Colgroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext('colgroup', true);
		$$renderer.push(`<colgroup><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></colgroup>`);
	});
}