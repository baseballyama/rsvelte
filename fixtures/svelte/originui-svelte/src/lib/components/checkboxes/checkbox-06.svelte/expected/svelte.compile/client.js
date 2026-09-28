import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);

export default function Checkbox_06($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Checkbox(node, {
		get id() {
			return uid;
		},
		class: 'rounded-full data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500',
		checked: true
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},
		class: 'peer-data-[state=checked]:line-throgh after:bg-muted-foreground peer-data-[state=checked]:text-muted-foreground relative after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:origin-bottom after:-translate-y-1/2 after:scale-x-0 after:transition-transform after:ease-in-out peer-data-[state=checked]:after:origin-bottom peer-data-[state=checked]:after:scale-x-100',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Fancy todo item');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}