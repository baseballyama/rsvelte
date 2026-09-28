import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let obj = { a: 0 };
	let count = 0;
	let doubled = $.derived(() => count * 2);
	let tripled = count * 3;

	console.log(obj);
	console.log(count);
	console.log(doubled());

	let { prop, other_prop = prop } = $$props;
	let prop_state = prop;
	let prop_derived = $.derived(() => prop);

	console.log(prop);
	console.log(prop_derived());

	// writes are okay
	count++;

	count = 1;
	obj.a++;
	obj.a = 1;
	prop_state = 1;
	prop_derived(1);

	// `count` here is correctly identified as a non-reference
	let typed = null;

	$$renderer.push(`<button>clicks: ${$.escape(
		// exports are okay as this is turned into a live reference
		count
	)}</button>`);

	$.bind_props($$props, { count });
}