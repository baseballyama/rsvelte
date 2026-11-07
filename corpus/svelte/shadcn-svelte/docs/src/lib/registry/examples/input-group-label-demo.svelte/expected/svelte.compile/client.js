import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InfoIcon from "@lucide/svelte/icons/info";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Label from "$lib/registry/ui/label/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p>We'll use this to send you notifications</p>`);
var root_2 = $.from_html(`<div class="grid w-full max-w-sm gap-4"><!> <!></div>`);

export default function Input_group_label_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { id: 'email', placeholder: 'shadcn' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Label.Root, ($$anchor, Label_Root) => {
								Label_Root($$anchor, {
									for: 'email',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('@');

										$.append($$anchor, text);
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
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node, 2);

	$.component(node_4, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { id: 'email-2', placeholder: 'shadcn@vercel.com' });
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'block-start',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_7 = $.first_child(fragment_3);

							$.component(node_7, () => Label.Root, ($$anchor, Label_Root_1) => {
								Label_Root_1($$anchor, {
									for: 'email-2',
									class: 'text-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Email');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
								Tooltip_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_9 = $.first_child(fragment_4);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_5 = $.comment();
												var node_10 = $.first_child(fragment_5);

												$.component(node_10, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
													InputGroup_Button($$anchor, $.spread_props(props, {
														variant: 'ghost',
														'aria-label': 'Help',
														class: 'ms-auto rounded-full',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															InfoIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_5);
											};

											$.component(node_9, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
												Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_11 = $.sibling(node_9, 2);

										$.component(node_11, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var p = root_1();

													$.append($$anchor, p);
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
	});

	$.reset(div);
	$.append($$anchor, div);
}