import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { x = void 0 } = $$props;

		function soThatTestReturnsAnObject() {
			return x;
		}

		$.bind_props($$props, { x, soThatTestReturnsAnObject });
	});
}