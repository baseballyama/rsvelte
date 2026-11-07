import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4"><p class="text-sm text-muted-foreground">Use <!> to open the command palette</p></div>`);

export default function Kbd_group_demo($$anchor) {
	var div = root_1();
	var p = $.child(div);
	var node = $.sibling($.child(p));

	$.component(node, () => Kbd.Group, ($$anchor, Kbd_Group) => {
		Kbd_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Kbd.Root, ($$anchor, Kbd_Root) => {
					Kbd_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Ctrl + B');

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

							var text_1 = $.text('Ctrl + K');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}