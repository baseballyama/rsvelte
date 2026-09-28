import * as $ from 'svelte/internal/server';
import FlowbiteSvelteLayout from "../layouts/FlowbiteSvelteLayout.svelte";
import ComponentsLayout from "../layouts/ComponentsLayout.svelte";

export default function _layout($$renderer, $$props) {
	let { data, children } = $$props;

	FlowbiteSvelteLayout($$renderer, {
		children: ($$renderer) => {
			ComponentsLayout($$renderer, {
				data,
				submenu: 'blocks',
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}