import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let cheese = ['Gruyere', 'Compté', 'Beaufort', 'Abondance'];

	function swap(a, b) {
		[cheese[a], cheese[b]] = [cheese[b], cheese[a]];
	}

	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(cheese);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let cheese = each_array[$$index];

		$$renderer.push(`<li>${$.escape(cheese)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
	$.bind_props($$props, { swap });
}