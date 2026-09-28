import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Dir($$anchor) {
	Tooltip($$anchor, {
		dir: 'rtl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
				Tooltip_Trigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Hover');

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
										class: 'card bg-surface-100-900 p-2  shadow-xl',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Hello Skeleton');

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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}