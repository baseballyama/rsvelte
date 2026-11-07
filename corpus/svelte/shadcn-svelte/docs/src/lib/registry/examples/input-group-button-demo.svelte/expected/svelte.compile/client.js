import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconCheck from "@tabler/icons-svelte/icons/check";
import IconCopy from "@tabler/icons-svelte/icons/copy";
import IconInfoCircle from "@tabler/icons-svelte/icons/info-circle";
import IconStar from "@tabler/icons-svelte/icons/star";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p class="font-medium">Your connection is not secure.</p> <p>You should not enter any sensitive information on this site.</p>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!> <!> <!></div>`);

export default function Input_group_button_demo($$anchor, $$props) {
	$.push($$props, true);

	let isFavorite = $.state(false);
	const clipboard = new UseClipboard();
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'https://x.com/shadcn', readonly: true });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
								InputGroup_Button($$anchor, {
									'aria-label': 'Copy',
									title: 'Copy',
									size: 'icon-xs',
									onclick: () => clipboard.copy("https://x.com/shadcn"),
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_4 = $.first_child(fragment_2);

										{
											var consequent = ($$anchor) => {
												IconCheck($$anchor, {});
											};

											var alternate = ($$anchor) => {
												IconCopy($$anchor, {});
											};

											$.if(node_4, ($$render) => {
												if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
											});
										}

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
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node, 2);

	$.component(node_5, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			class: '[--radius:9999px]',
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_2();
				var node_6 = $.first_child(fragment_5);

				$.component(node_6, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_7 = $.first_child(fragment_6);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_7 = $.comment();
									var node_8 = $.first_child(fragment_7);

									$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
										InputGroup_Addon_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_9 = $.first_child(fragment_8);

												$.component(node_9, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
													InputGroup_Button_1($$anchor, $.spread_props(props, {
														variant: 'secondary',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															IconInfoCircle($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								};

								$.component(node_7, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
									Popover_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_10 = $.sibling(node_7, 2);

							$.component(node_10, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									align: 'start',
									class: 'flex flex-col gap-1 rounded-xl text-sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();

										$.next(2);
										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_6, 2);

				$.component(node_11, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						class: 'ps-1.5 text-muted-foreground',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = $.comment();
							var node_12 = $.first_child(fragment_11);

							$.component(node_12, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('https://');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});

				var node_13 = $.sibling(node_11, 2);

				$.component(node_13, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, {});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = $.comment();
							var node_15 = $.first_child(fragment_12);

							$.component(node_15, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
								InputGroup_Button_2($$anchor, {
									onclick: () => $.set(isFavorite, !$.get(isFavorite)),
									size: 'icon-xs',
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => $.get(isFavorite) ? "fill-blue-600 stroke-blue-600" : "");

											IconStar($$anchor, {
												get class() {
													return $.get($0);
												}
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node_5, 2);

	$.component(node_16, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
		InputGroup_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_14 = root();
				var node_17 = $.first_child(fragment_14);

				$.component(node_17, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, { placeholder: 'Type to search...' });
				});

				var node_18 = $.sibling(node_17, 2);

				$.component(node_18, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
					InputGroup_Addon_4($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = $.comment();
							var node_19 = $.first_child(fragment_15);

							$.component(node_19, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
								InputGroup_Button_3($$anchor, {
									variant: 'secondary',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Search');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_14);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}