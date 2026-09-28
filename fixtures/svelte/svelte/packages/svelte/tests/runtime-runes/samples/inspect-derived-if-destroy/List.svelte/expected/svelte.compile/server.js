import * as $ from 'svelte/internal/server';

export default function List($$renderer, $$props) {
	let { things } = $$props;

	;;
	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(things);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];

		$$renderer.push(`<li>thing ${$.escape(thing.id)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}