import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { readonly, readonlyWithDefault = 1, binding = void 0 } = $$props;

		$$renderer.push(`<p>readonly: ${$.escape(readonly)}
	readonlyWithDefault: ${$.escape(readonlyWithDefault)}
	binding: ${$.escape(binding)}</p> <button>set bindings to 5</button> <button>set bindings to undefined</button>`);

		$.bind_props($$props, { binding });
	});
}