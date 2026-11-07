import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bar = void 0 } = $$props;

		$.bind_props($$props, { bar });
	});
}