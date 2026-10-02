import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Resizable from "$lib/registry/ui/resizable/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex h-full flex-col items-center justify-center gap-2 p-6"><span class="font-semibold"> </span></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Resizable_controlled($$anchor) {
	let sizes = $.state($.proxy([30, 70]));

	Example($$anchor, {
		title: 'Controlled',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Resizable.PaneGroup, ($$anchor, Resizable_PaneGroup) => {
				Resizable_PaneGroup($$anchor, {
					direction: 'horizontal',
					class: 'min-h-[200px] rounded-lg border',
					onLayoutChange: (newSizes) => {
						$.set(sizes, newSizes, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Resizable.Pane, ($$anchor, Resizable_Pane) => {
							Resizable_Pane($$anchor, {
								defaultSize: 30,
								minSize: 20,
								children: ($$anchor, $$slotProps) => {
									var div = root();
									var span = $.child(div);
									var text = $.only_child(span);

									$.reset(div);
									$.template_effect(($0) => $.set_text(text, `${$0 ?? ''}%`), [() => Math.round($.get(sizes)[0] ?? 30)]);
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
								defaultSize: 70,
								minSize: 30,
								children: ($$anchor, $$slotProps) => {
									var div_1 = root();
									var span_1 = $.child(div_1);
									var text_1 = $.only_child(span_1);

									$.reset(div_1);
									$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''}%`), [() => Math.round($.get(sizes)[1] ?? 70)]);
									$.append($$anchor, div_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}