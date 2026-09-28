import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`Accept <!>`, 1);
var root_1 = $.from_html(`Cancel <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-wrap items-center gap-4"><!> <!></div>`);

export default function Kbd_button_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	Button(node, {
		variant: 'outline',
		size: 'sm',
		class: 'pe-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			$.component(node_1, () => Kbd.Root, ($$anchor, Kbd_Root) => {
				Kbd_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('⏎');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		variant: 'outline',
		size: 'sm',
		class: 'pe-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_3 = $.sibling($.first_child(fragment_1));

			$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
				Kbd_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Esc');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}