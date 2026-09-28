import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!></div>`);

export default function Kbd_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			$.component(node, () => Kbd.Root, ($$anchor, Kbd_Root) => {
				Kbd_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Ctrl');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
				Kbd_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('⌘K');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
				Kbd_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Ctrl + B');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}