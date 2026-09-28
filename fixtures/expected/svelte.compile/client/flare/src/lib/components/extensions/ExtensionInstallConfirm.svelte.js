import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import { Button } from '$lib/components/ui/button';
import * as Accordion from '$lib/components/ui/accordion';
import { TriangleAlert } from '@lucide/svelte';

var root = $.from_html(`<li><strong> </strong> </li>`);
var root_1 = $.from_html(`<li> </li>`);
var root_2 = $.from_html(`<ul class="list-disc space-y-2 pl-5 text-left text-xs"><!> <!></ul>`);
var root_3 = $.from_html(`<!> <!>`, 1);

var root_4 = $.from_html(
	`This extension may not work as expected on your system. We recommend proceeding with
				caution. <!>`,
	1
);

var root_5 = $.from_html(`<div class="flex flex-col items-center gap-2 text-center"><!> <!></div> <!>`, 1);

export default function ExtensionInstallConfirm($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15);
	const isTruncated = $.derived(() => $$props.violations.length > 3);
	const truncatedViolations = $.derived(() => $$props.violations.slice(0, 3));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			onOpenChange: (isOpen) => !isOpen && $$props.oncancel(),
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_5();
										var div = $.first_child(fragment_3);
										var node_3 = $.child(div);

										TriangleAlert(node_3, { class: 'size-12 text-yellow-400' });

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Potential Incompatibility Detected');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div);

										var node_5 = $.sibling(div, 2);

										$.component(node_5, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												class: 'text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_4 = root_4();
													var node_6 = $.sibling($.first_child(fragment_4));

													$.component(node_6, () => Accordion.Root, ($$anchor, Accordion_Root) => {
														Accordion_Root($$anchor, {
															class: 'w-full pt-4',
															type: 'multiple',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_7 = $.first_child(fragment_5);

																$.component(node_7, () => Accordion.Item, ($$anchor, Accordion_Item) => {
																	Accordion_Item($$anchor, {
																		value: 'details',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root_3();
																			var node_8 = $.first_child(fragment_6);

																			$.component(node_8, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
																				Accordion_Trigger($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_1 = $.text('Technical Details');

																						$.append($$anchor, text_1);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_9 = $.sibling(node_8, 2);

																			$.component(node_9, () => Accordion.Content, ($$anchor, Accordion_Content) => {
																				Accordion_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var ul = root_2();
																						var node_10 = $.child(ul);

																						$.each(node_10, 17, () => $.get(truncatedViolations), $.index, ($$anchor, violation) => {
																							var li = root();
																							var strong = $.child(li);
																							var text_2 = $.only_child(strong);
																							var text_3 = $.sibling(strong);

																							$.reset(li);

																							$.template_effect(() => {
																								$.set_text(text_2, `${$.get(violation).commandName ?? ''}:`);
																								$.set_text(text_3, ` ${$.get(violation).reason ?? ''}`);
																							});

																							$.append($$anchor, li);
																						});

																						var node_11 = $.sibling(node_10, 2);

																						{
																							var consequent = ($$anchor) => {
																								var li_1 = root_1();
																								var text_4 = $.only_child(li_1);

																								$.template_effect(() => $.set_text(text_4, `... ${$$props.violations.length - 3} more warnings`));
																								$.append($$anchor, li_1);
																							};

																							$.if(node_11, ($$render) => {
																								if ($.get(isTruncated)) $$render(consequent);
																							});
																						}

																						$.reset(ul);
																						$.append($$anchor, ul);
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

							var node_12 = $.sibling(node_2, 2);

							$.component(node_12, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_3();
										var node_13 = $.first_child(fragment_7);

										$.component(node_13, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												onclick: () => $$props.oncancel(),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Cancel');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(props, {
													onclick: () => $$props.onconfirm(),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('Install anyway');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_14, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
												AlertDialog_Action($$anchor, { child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_7);
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
	$.pop();
}