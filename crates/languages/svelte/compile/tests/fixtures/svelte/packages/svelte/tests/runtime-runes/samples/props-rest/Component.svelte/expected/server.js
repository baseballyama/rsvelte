import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!----> <ul><!--[-->`);

	const each_array = $.ensure_array_like(Object.getOwnPropertyNames(rest));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];

		$$renderer.push(`<li>${$.escape(n)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}