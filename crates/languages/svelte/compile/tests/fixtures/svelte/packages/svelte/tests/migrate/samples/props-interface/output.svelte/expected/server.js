import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** foo */
		/** should not create a prop */
		let { foo = void 0, bar = true } = $$props;

		foo = '';
		$.bind_props($$props, { foo });
	});
}