import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!> <!></div>`);

export default function Kbd_arrow_keys($$anchor) {
	Example($$anchor, {
		title: 'Arrow Keys',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			$.component(node, () => Kbd.Root, ($$anchor, Kbd_Root) => {
				Kbd_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('↑');

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

						var text_1 = $.text('↓');

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

						var text_2 = $.text('←');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root_3) => {
				Kbd_Root_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('→');

						$.append($$anchor, text_3);
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