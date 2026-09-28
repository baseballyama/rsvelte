import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import CIDRDiff from '$lib/components/tools/CIDRDiff.svelte';
import CIDROverlap from '$lib/components/tools/CIDROverlap.svelte';
import CIDRContains from '$lib/components/tools/CIDRContains.svelte';

export default function _page($$anchor) {
	let selectedTool = $.state('diff');

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
		$.set(selectedTool, value, true);
	}

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
		onNavChange: handleNavChange,
		get selectedNav() {
			return $.get(selectedTool);
		},

		set selectedNav($$value) {
			$.set(selectedTool, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					CIDRDiff($$anchor, {});
				};

				var consequent_1 = ($$anchor) => {
					CIDROverlap($$anchor, {});
				};

				var consequent_2 = ($$anchor) => {
					CIDRContains($$anchor, {});
				};

				$.if(node, ($$render) => {
					if ($.get(selectedTool) === 'diff') $$render(consequent); else if ($.get(selectedTool) === 'overlap') $$render(consequent_1, 1); else if ($.get(selectedTool) === 'contains') $$render(consequent_2, 2);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}