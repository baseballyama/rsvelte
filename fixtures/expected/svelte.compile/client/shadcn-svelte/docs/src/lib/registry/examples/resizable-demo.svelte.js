import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Resizable from "$lib/registry/ui/resizable/index.js";

var root = $.from_html(`<div class="flex h-[200px] items-center justify-center p-6"><span class="font-semibold">One</span></div>`);
var root_1 = $.from_html(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Two</span></div>`);
var root_2 = $.from_html(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Three</span></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Resizable_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Resizable.PaneGroup, ($$anchor, Resizable_PaneGroup) => {
		Resizable_PaneGroup($$anchor, {
			direction: 'horizontal',
			class: 'max-w-md rounded-lg border',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Resizable.Pane, ($$anchor, Resizable_Pane) => {
					Resizable_Pane($$anchor, {
						defaultSize: 50,
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
						defaultSize: 50,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Resizable.PaneGroup, ($$anchor, Resizable_PaneGroup_1) => {
								Resizable_PaneGroup_1($$anchor, {
									direction: 'vertical',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Resizable.Pane, ($$anchor, Resizable_Pane_2) => {
											Resizable_Pane_2($$anchor, {
												defaultSize: 25,
												children: ($$anchor, $$slotProps) => {
													var div_1 = root_1();

													$.append($$anchor, div_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Resizable.Handle, ($$anchor, Resizable_Handle_1) => {
											Resizable_Handle_1($$anchor, {});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Resizable.Pane, ($$anchor, Resizable_Pane_3) => {
											Resizable_Pane_3($$anchor, {
												defaultSize: 75,
												children: ($$anchor, $$slotProps) => {
													var div_2 = root_2();

													$.append($$anchor, div_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
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
	});

	$.append($$anchor, fragment);
}