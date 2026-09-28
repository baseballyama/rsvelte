import * as $ from 'svelte/internal/server';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import CIDROverlap from '$lib/components/tools/CIDROverlap.svelte';
import { SUB_NAV } from '$lib/constants/nav';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedTool = 'overlap';

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
			label: item.label.split(' ')[0],
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: toolDescriptions[selectedTool].title,
				description: toolDescriptions[selectedTool].description,
				navOptions,
				hideLabels: true,
				get selectedNav() {
					return selectedTool;
				},

				set selectedNav($$value) {
					selectedTool = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					CIDROverlap($$renderer, {});
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
	});
}