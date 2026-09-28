import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

var root = $.from_html(`<div class="group relative"><!> <!></div>`);

export default function Textarea_13($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},
		class: 'bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Textarea with overlapping label');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Textarea(node_1, {
		get id() {
			return uid;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}