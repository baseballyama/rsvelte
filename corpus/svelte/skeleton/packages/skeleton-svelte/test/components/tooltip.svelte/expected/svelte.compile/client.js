import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_1($$anchor) {
	Tooltip($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
				Tooltip_Trigger($$anchor, { 'data-testid': 'trigger' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Tooltip.Positioner, ($$anchor, Tooltip_Positioner) => {
				Tooltip_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
							Tooltip_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Tooltip.Arrow, ($$anchor, Tooltip_Arrow) => {
										Tooltip_Arrow($$anchor, {
											'data-testid': 'arrow',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Tooltip.ArrowTip, ($$anchor, Tooltip_ArrowTip) => {
													Tooltip_ArrowTip($$anchor, { 'data-testid': 'arrow-tip' });
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
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}