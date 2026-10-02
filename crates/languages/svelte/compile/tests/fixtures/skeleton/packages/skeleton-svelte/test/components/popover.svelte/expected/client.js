import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Popover_1($$anchor) {
	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Anchor, ($$anchor, Popover_Anchor) => {
				Popover_Anchor($$anchor, { 'data-testid': 'anchor' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
				Popover_Trigger($$anchor, { 'data-testid': 'trigger' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
				Popover_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
										Popover_Arrow($$anchor, {
											'data-testid': 'arrow',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => Popover.ArrowTip, ($$anchor, Popover_ArrowTip) => {
													Popover_ArrowTip($$anchor, { 'data-testid': 'arrow-tip' });
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_4, 2);

									$.component(node_6, () => Popover.Title, ($$anchor, Popover_Title) => {
										Popover_Title($$anchor, { 'data-testid': 'title' });
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Popover.Description, ($$anchor, Popover_Description) => {
										Popover_Description($$anchor, { 'data-testid': 'description' });
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Popover.CloseTrigger, ($$anchor, Popover_CloseTrigger) => {
										Popover_CloseTrigger($$anchor, { 'data-testid': 'close-trigger' });
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