import * as $ from 'svelte/internal/server';

export default function Rename_runes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { foo, bar = void 0 } = $$props;

		$$renderer.push(`<!---->${$.escape(foo)}
${$.escape(bar)}`);

		$.bind_props($$props, { bar });
	});
}