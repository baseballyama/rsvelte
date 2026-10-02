import * as $ from 'svelte/internal/server';

export default function TestRunes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { foo, bar = void 0 } = $$props;

		function baz() {}

		$.bind_props($$props, { bar, baz });
	});
}