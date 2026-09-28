import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cmdOrCtrl, optionOrAlt } from '$lib/hooks/is-mac.svelte';
import { Kbd } from '$lib/components/ui/kbd';

var root = $.from_html(`<div class="flex flex-col place-items-center gap-2"><div class="flex flex-col place-items-center gap-2"><span class="text-muted-foreground text-sm">Command/Ctrl</span> <!></div> <div class="flex flex-col place-items-center gap-2"><span class="text-muted-foreground text-sm">Option/Alt</span> <!></div></div>`);

export default function Is_mac_keys($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Kbd(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, cmdOrCtrl));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2), 2);

	Kbd(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, optionOrAlt));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}