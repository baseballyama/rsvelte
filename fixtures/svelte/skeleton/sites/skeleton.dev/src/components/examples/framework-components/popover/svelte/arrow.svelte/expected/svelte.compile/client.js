import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Arrow($$anchor) {
	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
				Popover_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Trigger');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
						Popover_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
									Popover_Content($$anchor, {
										class: 'card max-w-md p-4 bg-surface-100-900 shadow-xl',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Popover.Description, ($$anchor, Popover_Description) => {
												Popover_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('This example will have a small arrow.');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_4, 2);

											$.component(node_5, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
												Popover_Arrow($$anchor, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														$.component(node_6, () => Popover.ArrowTip, ($$anchor, Popover_ArrowTip) => {
															Popover_ArrowTip($$anchor, {});
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}