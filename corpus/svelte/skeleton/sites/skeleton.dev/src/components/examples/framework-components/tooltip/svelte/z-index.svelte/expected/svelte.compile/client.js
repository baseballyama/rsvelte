import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-4"><!> <!> <div class="col-span-2 h-[100px] relative"><div class="rounded bg-primary-200-800/75 w-full h-full z-10 flex justify-center items-center absolute">Sibling (10)</div></div></div>`);

export default function Z_index($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Tooltip(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
				Tooltip_Trigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Default (auto)');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			Portal(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.component(node_3, () => Tooltip.Positioner, ($$anchor, Tooltip_Positioner) => {
						Tooltip_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
									Tooltip_Content($$anchor, {
										class: 'card bg-surface-100-900 p-2  shadow-xl',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('This example will be below the sibling.');

											$.append($$anchor, text_1);
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	Tooltip(node_5, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_6 = $.first_child(fragment_3);

			$.component(node_6, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
				Tooltip_Trigger_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Above (20)');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_6, 2);

			Portal(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => Tooltip.Positioner, ($$anchor, Tooltip_Positioner_1) => {
						Tooltip_Positioner_1($$anchor, {
							class: 'z-20!',
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_9 = $.first_child(fragment_5);

								$.component(node_9, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
									Tooltip_Content_1($$anchor, {
										class: 'card bg-surface-100-900 p-2  shadow-xl',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('This example will be above the sibling.');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}