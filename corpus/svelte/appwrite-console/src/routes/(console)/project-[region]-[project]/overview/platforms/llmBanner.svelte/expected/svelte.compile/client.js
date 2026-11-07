import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '$lib/helpers/copy';
import { Button } from '$lib/elements/forms';
import { ActionMenu, Alert, Icon, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';
import { IconChevronDown, IconChevronUp, IconLovable } from '@appwrite.io/pink-icons-svelte';
import { addNotification } from '$lib/stores/notifications';
import { buildPlatformConfig, generatePromptFromConfig } from './store';
import { Click, trackEvent } from '$lib/actions/analytics';
import IconAINotification from '../../databases/database-[database]/(suggestions)/icon/aiNotification.svelte';
import Avatar from '$lib/components/avatar.svelte';
import CursorIcon from '$routes/(console)/project-[region]-[project]/overview/components/CursorIconLarge.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<img/>`);
var root_2 = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function LlmBanner($$anchor, $$props) {
	$.push($$props, true);

	let openers = $.prop($$props, 'openers', 19, () => []);

	const config = $.derived(() => {
		if ($$props.config) return $$props.config;
		if ($$props.platform && $$props.configCode) return buildPlatformConfig($$props.platform, $$props.configCode, $$props.alreadyExistsInstructions);

		throw new Error('LlmBanner: must provide either config OR (platform + configCode)');
	});

	const prompt = $.derived(() => generatePromptFromConfig($.get(config)));
	let showAlert = $.state(true);

	const openersConfig = {
		cursor: {
			id: 'cursor',
			label: 'Open in Cursor',
			description: 'Set up starter kit in Cursor',
			href: (p) => {
				trackEvent(Click.OpenInCursorClick, { platform: $.get(config).title });

				const u = new URL('https://cursor.com/link/prompt');

				u.searchParams.set('text', p);

				return u.toString();
			},
			icon: CursorIcon,
			alt: 'Cursor'
		},
		lovable: {
			id: 'lovable',
			label: 'Open in Lovable',
			description: 'Set up starter kit in Lovable',
			href: (p) => {
				trackEvent(Click.OpenInLovableClick, { platform: $.get(config).title });

				const u = new URL('https://lovable.dev/');

				u.searchParams.set('autosubmit', 'true');
				u.searchParams.set('prompt', p);

				return u.toString();
			},
			icon: IconLovable,
			alt: 'Lovable'
		}
	};

	const validOpeners = $.derived(() => openers().filter((id) => openersConfig[id]));

	async function copyPrompt() {
		await copy($.get(prompt));
		trackEvent(Click.CopyPromptStarterKitClick, { platform: $.get(config).title });
		addNotification({ type: 'success', message: 'Prompt copied to clipboard' });
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			{
				$.css_props(node_1, () => ({
					'--bgcolor-neutral-default': 'var(--bgcolor-neutral-primary)',
					'--fgcolor-info': 'var(--fgcolor-neutral-primary)'
				}));

				$.component(node_1.lastChild, () => Alert.Inline, ($$anchor, Alert_Inline) => {
					Alert_Inline($$anchor, {
						status: 'info',
						title: 'Set up your starter kit with AI',
						dismissible: true,
						$$events: { dismiss: () => $.set(showAlert, false) },
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									direction: 'column',
									class: 'alert-content',
									gap: 'l',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												direction: 'column',
												alignItems: 'center',
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
														Typography_Text($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Copy the prompt or open it directly in an AI tool like Cursor or Lovable to get\n                    step-by-step instructions, starter code, and SDK commands for your project.');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_3, 2);

										Popover(node_5, {
											padding: 'none',
											placement: 'bottom-start',
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const toggle = $.derived(() => $$slotProps.toggle);
													const showing = $.derived(() => $$slotProps.showing);
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															direction: 'row',
															gap: 'none',
															alignItems: 'center',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_7 = $.first_child(fragment_6);

																{
																	let $0 = $.derived(() => $.get(validOpeners).length ? 'btn-no-right-radius' : '');
																	let $1 = $.derived(() => !$.get(prompt) || $.get(prompt).length === 0);

																	Button(node_7, {
																		secondary: true,
																		size: 's',
																		get class() {
																			return $.get($0);
																		},

																		get disabled() {
																			return $.get($1);
																		},
																		$$events: { click: copyPrompt },
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Copy setup prompt');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																}

																var node_8 = $.sibling(node_7, 2);

																{
																	var consequent = ($$anchor) => {
																		{
																			let $0 = $.derived(() => !$.get(prompt) || $.get(prompt).length === 0);

																			Button($$anchor, {
																				secondary: true,
																				size: 's',
																				class: 'btn-no-left-radius',
																				icon: true,
																				ariaLabel: 'Open action menu',
																				get disabled() {
																					return $.get($0);
																				},

																				$$events: {
																					click: function (...$$args) {
																						$.get(toggle)?.apply(this, $$args);
																					}
																				},

																				children: ($$anchor, $$slotProps) => {
																					{
																						let $0 = $.derived(() => $.get(showing) ? IconChevronUp : IconChevronDown);

																						Icon($$anchor, {
																							get icon() {
																								return $.get($0);
																							}
																						});
																					}
																				},
																				$$slots: { default: true }
																			});
																		}
																	};

																	$.if(node_8, ($$render) => {
																		if ($.get(validOpeners).length) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},

												tooltip: ($$anchor, $$slotProps) => {
													const toggle = $.derived(() => $$slotProps.toggle);
													var fragment_9 = $.comment();
													var node_9 = $.first_child(fragment_9);

													$.component(node_9, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
														ActionMenu_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = $.comment();
																var node_10 = $.first_child(fragment_10);

																$.each(node_10, 17, () => $.get(validOpeners), $.index, ($$anchor, openerId) => {
																	const o = $.derived(() => openersConfig[$.get(openerId)]);
																	var fragment_11 = $.comment();
																	var node_11 = $.first_child(fragment_11);

																	{
																		var consequent_3 = ($$anchor) => {
																			var fragment_12 = $.comment();
																			var node_12 = $.first_child(fragment_12);

																			$.component(node_12, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																				ActionMenu_Item_Button($$anchor, {
																					$$events: {
																						click: (e) => {
																							window.open($.get(o).href($.get(prompt)), '_blank', 'noopener,noreferrer');
																							$.get(toggle)(e);
																						}
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = $.comment();
																						var node_13 = $.first_child(fragment_13);

																						$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																							Layout_Stack_3($$anchor, {
																								direction: 'row',
																								gap: 's',
																								alignItems: 'center',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_14 = root();
																									var node_14 = $.first_child(fragment_14);

																									Avatar(node_14, {
																										size: 's',
																										get alt() {
																											return $.get(o).alt;
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_15 = $.comment();
																											var node_15 = $.first_child(fragment_15);

																											{
																												var consequent_1 = ($$anchor) => {
																													Icon($$anchor, {
																														get icon() {
																															return $.get(o).icon;
																														},
																														size: 'l'
																													});
																												};

																												var consequent_2 = ($$anchor) => {
																													var img = root_1();

																													$.template_effect(() => {
																														$.set_attribute(img, 'src', $.get(o).imgSrc);
																														$.set_attribute(img, 'alt', $.get(o).alt);
																													});

																													$.append($$anchor, img);
																												};

																												$.if(node_15, ($$render) => {
																													if ($.get(o).icon) $$render(consequent_1); else if ($.get(o).imgSrc) $$render(consequent_2, 1);
																												});
																											}

																											$.append($$anchor, fragment_15);
																										},
																										$$slots: { default: true }
																									});

																									var node_16 = $.sibling(node_14, 2);

																									$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																										Layout_Stack_4($$anchor, {
																											gap: 'none',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_17 = root();
																												var node_17 = $.first_child(fragment_17);

																												$.component(node_17, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																													Typography_Text_1($$anchor, {
																														color: '--fgcolor-neutral-secondary',
																														variant: 'm-500',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_2 = $.text();

																															$.template_effect(() => $.set_text(text_2, $.get(o).label));
																															$.append($$anchor, text_2);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_18 = $.sibling(node_17, 2);

																												$.component(node_18, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																													Typography_Text_2($$anchor, {
																														color: '--fgcolor-neutral-tertiary',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_3 = $.text();

																															$.template_effect(() => $.set_text(text_3, $.get(o).description));
																															$.append($$anchor, text_3);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_17);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_14);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_12);
																		};

																		$.if(node_11, ($$render) => {
																			if ($.get(o)) $$render(consequent_3);
																		});
																	}

																	$.append($$anchor, fragment_11);
																});

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												}
											}
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},

						$$slots: {
							default: true,
							icon: ($$anchor, $$slotProps) => {
								IconAINotification($$anchor, {});
							}
						}
					});
				});

				$.reset(node_1);
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(showAlert)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}