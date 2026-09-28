import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Tooltip } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_popover_test($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
								Popover_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
													Popover_Trigger($$anchor, $.spread_props(props, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Resize');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_4);
											};

											$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
												Tooltip_Trigger($$anchor, { 'data-testid': 'trigger', child, $$slots: { child: true } });
											});
										}

										var node_5 = $.sibling(node_3, 2);

										$.component(node_5, () => Popover.Portal, ($$anchor, Popover_Portal) => {
											Popover_Portal($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
														Popover_Content($$anchor, { 'data-testid': 'popover-content' });
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_2, 2);

							$.component(node_7, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
								Tooltip_Portal($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												'data-testid': 'tooltip-content',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Hello World!');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
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