import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
import CircleIcon from '@lucide/svelte/icons/circle';

var root = $.from_html(`<div class="inline-grid w-fit grid-cols-3 gap-1"><!> <!> <div class="flex items-center justify-center" aria-hidden="true"><!></div> <!> <!></div>`);

export default function Button_50($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		class: 'col-start-2',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera up',
		children: ($$anchor, $$slotProps) => {
			ChevronUpIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		class: 'col-start-1',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera left',
		children: ($$anchor, $$slotProps) => {
			ChevronLeftIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	CircleIcon(node_2, { class: 'opacity-60', size: 16 });
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	Button(node_3, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera right',
		children: ($$anchor, $$slotProps) => {
			ChevronRightIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		class: 'col-start-2',
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Pan camera down',
		children: ($$anchor, $$slotProps) => {
			ChevronDownIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}