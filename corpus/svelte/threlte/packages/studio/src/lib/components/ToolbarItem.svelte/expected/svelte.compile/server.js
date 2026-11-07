import * as $ from 'svelte/internal/server';
import Portal from './Portal.svelte';

export default function ToolbarItem($$renderer, $$props) {
	let { position = 'left', children } = $$props;

	Portal($$renderer, {
		target: `.toolbar-items-${$.stringify(position)}`,
		children: ($$renderer) => {
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}