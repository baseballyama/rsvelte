import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

var root = $.from_html(`<div class="inline-flex items-center gap-2"><!> <!></div>`);

export default function Button_12($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		variant: 'ghost',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Cancel');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Save');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}