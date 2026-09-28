import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

var root = $.from_html(`<div class="mb-2 flex items-center justify-between gap-1"><!> <span class="text-muted-foreground text-sm">Optional</span></div> <!>`, 1);

export default function Textarea_04($$anchor) {
	const uid = $.props_id();
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},
		class: 'mb-0',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Textarea with hint');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Textarea(node_1, {
		get id() {
			return uid;
		},
		placeholder: 'Leave a comment'
	});

	$.append($$anchor, fragment);
}