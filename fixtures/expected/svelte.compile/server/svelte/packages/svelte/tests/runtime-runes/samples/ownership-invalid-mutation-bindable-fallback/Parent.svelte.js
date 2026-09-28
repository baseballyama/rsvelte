import * as $ from 'svelte/internal/server';

export default function Parent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { test = {} } = $$props;

		$$renderer.push(`<button></button> <button></button> ${$.escape(test)}`);
		$.bind_props($$props, { test });
	});
}