import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { options = 'foo' } = $$props;

		options = 'bar';
		$$renderer.push(`<!---->${$.escape(options)}`);
		$.bind_props($$props, { options });
	});
}