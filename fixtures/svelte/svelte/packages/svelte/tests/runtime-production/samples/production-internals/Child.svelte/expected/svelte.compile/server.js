import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { foo = 42 } = $$props;

		$$renderer.push(`<!---->${$.escape(foo)};`);
		$.bind_props($$props, { foo });
	});
}