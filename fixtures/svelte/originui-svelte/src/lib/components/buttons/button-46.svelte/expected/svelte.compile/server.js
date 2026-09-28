import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

export default function Button_46($$renderer) {
	let isExpanded = false;

	function toggleExpand() {
		isExpanded = !isExpanded;
	}

	Button($$renderer, {
		class: 'gap-1',
		variant: 'ghost',
		onclick: toggleExpand,
		'aria-expanded': isExpanded,
		'aria-controls': 'expandable-content',
		children: ($$renderer) => {
			if (isExpanded) {
				$$renderer.push(`<!--[0-->Show less `);

				ChevronUpIcon($$renderer, {
					className: '-me-1',
					size: 16,
					'stroke-width': '2',
					'aria-hidden': 'true'
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->Show more `);

				ChevronDownIcon($$renderer, {
					className: '-me-1',
					size: 16,
					'stroke-width': '2',
					'aria-hidden': 'true'
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}