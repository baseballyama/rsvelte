import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex items-center gap-2">Save Changes <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-2">Print Document <!></div>`);
var root_3 = $.from_html(`<div class="flex flex-wrap gap-4"><!></div>`);

export default function Kbd_tooltip_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ size: 'sm', variant: 'outline' }, props, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Save');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
									Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div_1 = root();
										var node_4 = $.sibling($.child(div_1));

										$.component(node_4, () => Kbd.Root, ($$anchor, Kbd_Root) => {
											Kbd_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('S');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_1);
										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
					Tooltip_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_6 = $.first_child(fragment_3);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ size: 'sm', variant: 'outline' }, props, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Print');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_6, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
									Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
								Tooltip_Content_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div_2 = root_2();
										var node_8 = $.sibling($.child(div_2));

										$.component(node_8, () => Kbd.Group, ($$anchor, Kbd_Group) => {
											Kbd_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_9 = $.first_child(fragment_5);

													$.component(node_9, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
														Kbd_Root_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Ctrl');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
														Kbd_Root_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('P');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_2);
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}