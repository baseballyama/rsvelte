import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Trim } from '$lib/components';
import { Link } from '$lib/elements';
import { Button } from '$lib/elements/forms';
import { IconExclamation, IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
import { ActionMenu, Icon, Layout, Popover, Tag, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

var root = $.from_html(`<div slot="tooltip">Not verified</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function DeploymentDomains($$anchor, $$props) {
	$.push($$props, true);

	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let hideQRCode = $.prop($$props, 'hideQRCode', 3, true),
		showQR = $.prop($$props, 'showQR', 3, () => {});

	let sortedDomains = $.derived(() => $$props.domains?.rules?.sort((a, b) => {
		if (a?.trigger === 'manual' && b?.trigger !== 'manual') {
			return -1;
		} else if (a?.trigger !== 'manual' && b?.trigger === 'manual') {
			return 1;
		}

		return 0;
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xxs',
			direction: 'row',
			alignItems: 'center',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_4 = ($$anchor) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => `${$regionalProtocol()}${$.get(sortedDomains)[0]?.domain}`);

							Link(node_2, {
								external: true,
								get href() {
									return $.get($0);
								},
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 'xxs',
											direction: 'row',
											alignItems: 'center',
											children: ($$anchor, $$slotProps) => {
												Trim($$anchor, {
													alternativeTrim: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_4 = $.first_child(fragment_5);

														$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																gap: 'xxs',
																direction: 'row',
																alignItems: 'flex-end',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_1();
																	var node_5 = $.first_child(fragment_6);

																	$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
																		Typography_Text($$anchor, {
																			variant: 'm-400',
																			color: '--fgcolor-neutral-primary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text = $.text();

																				$.template_effect(() => $.set_text(text, $.get(sortedDomains)[0]?.domain));
																				$.append($$anchor, text);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_6 = $.sibling(node_5, 2);

																	{
																		var consequent = ($$anchor) => {
																			Tooltip($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					Icon($$anchor, {
																						get icon() {
																							return IconExclamation;
																						},
																						size: 's',
																						color: '--bgcolor-warning'
																					});
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$anchor, $$slotProps) => {
																						var div = root();

																						$.append($$anchor, div);
																					}
																				}
																			});
																		};

																		$.if(node_6, ($$render) => {
																			if ($.get(sortedDomains)[0]?.status !== 'verified') $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						}

						var node_7 = $.sibling(node_2, 2);

						{
							var consequent_2 = ($$anchor) => {
								Popover($$anchor, {
									padding: 'none',
									placement: 'bottom-end',
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const toggle = $.derived(() => $$slotProps.toggle);

											Tag($$anchor, {
												size: 'xs',
												$$events: {
													click: function (...$$args) {
														$.get(toggle)?.apply(this, $$args);
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, `+${$.get(sortedDomains).length - 1}`));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										},

										tooltip: ($$anchor, $$slotProps) => {
											var fragment_13 = $.comment();
											var node_8 = $.first_child(fragment_13);

											$.component(node_8, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
												ActionMenu_Root($$anchor, {
													width: '20px',
													children: ($$anchor, $$slotProps) => {
														var fragment_14 = $.comment();
														var node_9 = $.first_child(fragment_14);

														$.each(node_9, 17, () => $.get(sortedDomains), $.index, ($$anchor, rule, i) => {
															var fragment_15 = $.comment();
															var node_10 = $.first_child(fragment_15);

															{
																var consequent_1 = ($$anchor) => {
																	var fragment_16 = $.comment();
																	var node_11 = $.first_child(fragment_16);

																	{
																		let $0 = $.derived(() => `${$regionalProtocol()}${$.get(rule).domain}`);

																		$.component(node_11, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor) => {
																			ActionMenu_Item_Anchor($$anchor, {
																				get href() {
																					return $.get($0);
																				},
																				external: true,
																				get leadingIcon() {
																					return IconExternalLink;
																				},

																				children: ($$anchor, $$slotProps) => {
																					Trim($$anchor, {
																						alternativeTrim: true,
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_2 = $.text();

																							$.template_effect(() => $.set_text(text_2, $.get(rule).domain));
																							$.append($$anchor, text_2);
																						},
																						$$slots: { default: true }
																					});
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	$.append($$anchor, fragment_16);
																};

																$.if(node_10, ($$render) => {
																	if (i !== 0) $$render(consequent_1);
																});
															}

															$.append($$anchor, fragment_15);
														});

														$.append($$anchor, fragment_14);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_13);
										}
									}
								});
							};

							$.if(node_7, ($$render) => {
								if ($.get(sortedDomains).length > 1) $$render(consequent_2);
							});
						}

						var node_12 = $.sibling(node_7, 2);

						{
							var consequent_3 = ($$anchor) => {
								Button($$anchor, {
									icon: true,
									secondary: true,
									size: 'xs',
									$$events: { click: () => showQR()(true) },
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											get icon() {
												return IconQrcode;
											},
											size: 's'
										});
									},
									$$slots: { default: true }
								});
							};

							$.if(node_12, ($$render) => {
								if (!hideQRCode()) $$render(consequent_3);
							});
						}

						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var fragment_21 = $.comment();
						var node_13 = $.first_child(fragment_21);

						$.component(node_13, () => Typography.Text, ($$anchor, Typography_Text_1) => {
							Typography_Text_1($$anchor, {
								variant: 'm-400',
								color: '--fgcolor-neutral-primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('No domains available');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_21);
					};

					$.if(node_1, ($$render) => {
						if ($$props.domains?.total) $$render(consequent_4); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}