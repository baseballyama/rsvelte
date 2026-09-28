import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { test = void 0 } = $$props;

		$$renderer.push(`<!---->${$.escape(test)}`);
		$.bind_props($$props, { test });
	});
}