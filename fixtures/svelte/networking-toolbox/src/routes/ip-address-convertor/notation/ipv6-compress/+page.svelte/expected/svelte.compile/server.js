import * as $ from 'svelte/internal/server';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import IPv6NotationConverter from '$lib/components/tools/IPv6NotationConverter.svelte';

export default function _page($$renderer) {
	let selectedTool = 'compress';

	const navOptions = [
		{
			value: 'expand',
			label: 'Expand',
			icon: 'ipv6-expand',
			href: '/ip-address-convertor/notation/ipv6-expand'
		},

		{
			value: 'compress',
			label: 'Compress',
			icon: 'ipv6-compress',
			href: '/ip-address-convertor/notation/ipv6-compress'
		}
	];

	const toolDescriptions = {
		expand: {
			title: 'IPv6 Address Expander',
			description: 'Convert compressed IPv6 addresses to their full 128-bit hexadecimal representation. This tool expands short IPv6 notation by adding leading zeros and replacing :: with the appropriate number of zero groups.'
		},
		compress: {
			title: 'IPv6 Address Compressor',
			description: 'Convert expanded IPv6 addresses to their compressed, shortened format. This tool uses :: notation to represent consecutive zero groups and removes leading zeros for a cleaner, more readable IPv6 address.'
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ToolContentContainer($$renderer, {
			title: toolDescriptions[selectedTool].title,
			description: toolDescriptions[selectedTool].description,
			navOptions,
			get selectedNav() {
				return selectedTool;
			},

			set selectedNav($$value) {
				selectedTool = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				IPv6NotationConverter($$renderer, { mode: 'compress' });
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}