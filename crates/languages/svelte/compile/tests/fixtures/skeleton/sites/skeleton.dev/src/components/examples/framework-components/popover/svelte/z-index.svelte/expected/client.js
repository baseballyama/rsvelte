import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-4"><!> <!> <div class="col-span-2 h-[100px] relative"><div class="rounded bg-primary-200-800/75 w-full h-full z-10 flex justify-center items-center absolute">Sibling (10)</div></div></div>`);

export default function Z_index($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
				Popover_Trigger($$anchor, {
					class: 'btn preset-filled',
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

					$.component(node_3, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
						Popover_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
									Popover_Content($$anchor, {
										class: 'card max-w-md p-4 bg-surface-100-900 space-y-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Popover.Description, ($$anchor, Popover_Description) => {
												Popover_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('This example will be below the sibling.');

														$.append($$anchor, text_1);
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Popover(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
				Popover_Trigger_1($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Above (20)');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_7, 2);

			Portal(node_8, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_9 = $.first_child(fragment_5);

					$.component(node_9, () => Popover.Positioner, ($$anchor, Popover_Positioner_1) => {
						Popover_Positioner_1($$anchor, {
							class: 'z-20!',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_10 = $.first_child(fragment_6);

								$.component(node_10, () => Popover.Content, ($$anchor, Popover_Content_1) => {
									Popover_Content_1($$anchor, {
										class: 'card max-w-md p-4 bg-surface-100-900 shadow-xl space-y-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = $.comment();
											var node_11 = $.first_child(fragment_7);

											$.component(node_11, () => Popover.Description, ($$anchor, Popover_Description_1) => {
												Popover_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('This example will be above the sibling.');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}