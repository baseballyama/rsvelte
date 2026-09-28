import * as $ from 'svelte/internal/server';
import { routes } from '$app/manifest';

export default function _page($$renderer) {
	$$renderer.push(`<h3>Tests</h3> <ul${$.attr_style('', { 'font-family': 'sans-serif' })}><!--[-->`);

	const each_array = $.ensure_array_like(routes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let route = each_array[$$index];

		$$renderer.push(`<li><a${$.attr('href', route.id)}>${$.escape(route.id)}</a></li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}