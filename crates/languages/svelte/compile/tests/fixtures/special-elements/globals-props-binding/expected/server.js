import * as $ from 'svelte/internal/server';

export default function Globals_props_binding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { width = void 0, x = void 0 } = $$props;
		$.bind_props($$props, { width, x });
	});
}
