import * as $ from 'svelte/internal/server';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import CIDRDiff from '$lib/components/tools/CIDRDiff.svelte';
import CIDROverlap from '$lib/components/tools/CIDROverlap.svelte';
import CIDRContains from '$lib/components/tools/CIDRContains.svelte';

export default function _page($$renderer) {
	let selectedTool = 'diff';

	const navOptions = [
		{ value: 'diff', label: 'Difference', icon: 'minus' },
		{ value: 'overlap', label: 'Overlap', icon: 'intersection' },
		{ value: 'contains', label: 'Contains', icon: 'containment' }
	];

	const toolDescriptions = {
		diff: {
			title: 'CIDR Difference (A - B)',
			description: 'Compute A - B where A and B are sets of IP addresses, CIDR blocks, or ranges. Shows minimal non-overlapping results.'
		},
		overlap: {
			title: 'CIDR Overlap Checker (A ∩ B)',
			description: 'Determine if two sets of IP addresses, CIDR blocks, or ranges intersect and show the overlapping regions.'
		},
		contains: {
			title: 'CIDR Containment Checker (A ⊇ B)',
			description: 'Check if set A fully contains each item in set B. Supports many-to-many containment analysis with detailed classification.'
		}
	};

	function handleNavChange(value) {
		selectedTool = value;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ToolContentContainer($$renderer, {
			title: toolDescriptions[selectedTool].title,
			description: toolDescriptions[selectedTool].description,
			navOptions,
			onNavChange: handleNavChange,
			get selectedNav() {
				return selectedTool;
			},

			set selectedNav($$value) {
				selectedTool = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				if (selectedTool === 'diff') {
					$$renderer.push('<!--[0-->');
					CIDRDiff($$renderer, {});
				} else if (selectedTool === 'overlap') {
					$$renderer.push('<!--[1-->');
					CIDROverlap($$renderer, {});
				} else if (selectedTool === 'contains') {
					$$renderer.push('<!--[2-->');
					CIDRContains($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
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