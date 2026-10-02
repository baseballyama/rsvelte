import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Resizable from "$lib/registry/ui/resizable/index.js";

var root = $.from_html(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Header</span></div>`);
var root_1 = $.from_html(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Content</span></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Resizable_vertical($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Resizable.PaneGroup, ($$anchor, Resizable_PaneGroup) => {
		Resizable_PaneGroup($$anchor, {
			direction: 'vertical',
			class: 'min-h-[200px] max-w-md rounded-lg border',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Resizable.Pane, ($$anchor, Resizable_Pane) => {
					Resizable_Pane($$anchor, {
						defaultSize: 25,
						children: ($$anchor, $$slotProps) => {
							var div = root();

							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Resizable.Handle, ($$anchor, Resizable_Handle) => {
					Resizable_Handle($$anchor, {});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Resizable.Pane, ($$anchor, Resizable_Pane_1) => {
					Resizable_Pane_1($$anchor, {
						defaultSize: 75,
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_1();

							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}