import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`Content <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	Tooltip($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
				Tooltip_Trigger($$anchor, {
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

					$.component(node_2, () => Tooltip.Positioner, ($$anchor, Tooltip_Positioner) => {
						Tooltip_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
									Tooltip_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_4 = root();
											var node_4 = $.sibling($.first_child(fragment_4));

											$.component(node_4, () => Tooltip.Arrow, ($$anchor, Tooltip_Arrow) => {
												Tooltip_Arrow($$anchor, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => Tooltip.ArrowTip, ($$anchor, Tooltip_ArrowTip) => {
															Tooltip_ArrowTip($$anchor, {});
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