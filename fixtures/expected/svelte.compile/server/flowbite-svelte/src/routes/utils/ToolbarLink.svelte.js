import * as $ from 'svelte/internal/server';
import ToolbarButton from "$lib/toolbar/ToolbarButton.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";

export default function ToolbarLink($$renderer, $$props) {
	let { children, name, $$slots, $$events, ...restProps } = $$props;

	ToolbarButton($$renderer, $.spread_props([
		{ name, size: 'lg', target: '_blank', rel: 'noreferrer' },
		restProps,
		{
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		}
	]));

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		class: 'dark:bg-gray-900',
		placement: 'bottom',
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(name)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}