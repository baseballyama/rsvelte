import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span>+</span> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-4"><!> <!></div>`);

export default function Kbd_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Kbd.Group, ($$anchor, Kbd_Group) => {
		Kbd_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Kbd.Root, ($$anchor, Kbd_Root) => {
					Kbd_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('⌘');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
					Kbd_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('⇧');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
					Kbd_Root_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('⌥');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Kbd.Root, ($$anchor, Kbd_Root_3) => {
					Kbd_Root_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('⌃');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node, 2);

	$.component(node_5, () => Kbd.Group, ($$anchor, Kbd_Group_1) => {
		Kbd_Group_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_6 = $.first_child(fragment_1);

				$.component(node_6, () => Kbd.Root, ($$anchor, Kbd_Root_4) => {
					Kbd_Root_4($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Ctrl');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_6, 4);

				$.component(node_7, () => Kbd.Root, ($$anchor, Kbd_Root_5) => {
					Kbd_Root_5($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('B');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}