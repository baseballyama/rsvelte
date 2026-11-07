import * as $ from 'svelte/internal/server';

export default function _4_simple_component_props_input($$renderer, $$props) {
	let { count = 0 } = $$props;

	$$renderer.push(`<!---->${$.escape(count)}`);
}