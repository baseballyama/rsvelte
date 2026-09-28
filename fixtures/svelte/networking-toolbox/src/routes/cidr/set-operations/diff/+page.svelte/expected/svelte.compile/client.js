import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import CIDRDiff from '$lib/components/tools/CIDRDiff.svelte';
import { SUB_NAV } from '$lib/constants/nav';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let selectedTool = $.state('diff');

	// Extract set operations nav items from nav.ts
	const setOperationsGroup = SUB_NAV['/cidr'].find((item) => 'title' in item && item.title === 'Set Operations');

	const navItems = setOperationsGroup && 'items' in setOperationsGroup ? setOperationsGroup.items : [];

	// Map icon names from nav.ts to match what the component expects
	const iconMap = {
		diff: 'minus',
		intersection: 'intersection',
		containment: 'containment'
	};

	// Map nav items to SegmentedControl format with hrefs
	const navOptions = navItems.map((item) => ({
		value: item.href.split('/').pop(),
		label: item.label.split(' ')[0], // Extract first word (Difference, Overlap, Contains)
		icon: iconMap[item.icon || ''] || item.icon,
		href: item.href
	}));

	// Map nav items to tool descriptions
	const toolDescriptions = navItems.reduce(
		(acc, item) => {
			const key = item.href.split('/').pop();

			acc[key] = { title: item.label, description: item.description || '' };

			return acc;
		},
		{}
	);

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
		hideLabels: true,
		get selectedNav() {
			return $.get(selectedTool);
		},

		set selectedNav($$value) {
			$.set(selectedTool, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			CIDRDiff($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.pop();
}