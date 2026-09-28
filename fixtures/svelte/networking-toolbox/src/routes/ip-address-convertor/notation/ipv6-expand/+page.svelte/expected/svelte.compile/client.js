import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import IPv6NotationConverter from '$lib/components/tools/IPv6NotationConverter.svelte';

export default function _page($$anchor) {
	let selectedTool = $.state('expand');

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

	ToolContentContainer($$anchor, {
		get title() {
			return toolDescriptions[$.get(selectedTool)].title;
		},

		get description() {
			return toolDescriptions[$.get(selectedTool)].description;
		},

		get navOptions() {
			return navOptions;
		},

		get selectedNav() {
			return $.get(selectedTool);
		},

		set selectedNav($$value) {
			$.set(selectedTool, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			IPv6NotationConverter($$anchor, { mode: 'expand' });
		},
		$$slots: { default: true }
	});
}