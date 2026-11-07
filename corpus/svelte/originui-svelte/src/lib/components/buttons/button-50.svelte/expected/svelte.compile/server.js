import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
import CircleIcon from '@lucide/svelte/icons/circle';

export default function Button_50($$renderer) {
	$$renderer.push(`<div class="inline-grid w-fit grid-cols-3 gap-1">`);

	Button($$renderer, {
		class: 'col-start-2',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera up',
		children: ($$renderer) => {
			ChevronUpIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'col-start-1',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera left',
		children: ($$renderer) => {
			ChevronLeftIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex items-center justify-center" aria-hidden="true">`);
	CircleIcon($$renderer, { class: 'opacity-60', size: 16 });
	$$renderer.push(`<!----></div> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera right',
		children: ($$renderer) => {
			ChevronRightIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'col-start-2',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera down',
		children: ($$renderer) => {
			ChevronDownIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}