import * as $ from 'svelte/internal/server';
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

export default function LlmBanner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			platform,
			configCode,
			alreadyExistsInstructions,
			config: customConfig,
			openers = []
		} = $$props;

		const config = $.derived(() => {
			if (customConfig) return customConfig;
			if (platform && configCode) return buildPlatformConfig(platform, configCode, alreadyExistsInstructions);

			throw new Error('LlmBanner: must provide either config OR (platform + configCode)');
		});

		const prompt = $.derived(() => generatePromptFromConfig(config()));
		let showAlert = true;

		const openersConfig = {
			cursor: {
				id: 'cursor',
				label: 'Open in Cursor',
				description: 'Set up starter kit in Cursor',
				href: (p) => {
					trackEvent(Click.OpenInCursorClick, { platform: config().title });

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
					trackEvent(Click.OpenInLovableClick, { platform: config().title });

					const u = new URL('https://lovable.dev/');

					u.searchParams.set('autosubmit', 'true');
					u.searchParams.set('prompt', p);

					return u.toString();
				},
				icon: IconLovable,
				alt: 'Lovable'
			}
		};

		const validOpeners = $.derived(() => openers.filter((id) => openersConfig[id]));

		async function copyPrompt() {
			await copy(prompt());
			trackEvent(Click.CopyPromptStarterKitClick, { platform: config().title });
			addNotification({ type: 'success', message: 'Prompt copied to clipboard' });
		}

		if (showAlert) {
			$$renderer.push('<!--[0-->');

			$.css_props(
				$$renderer,
				true,
				{
					'--bgcolor-neutral-default': 'var(--bgcolor-neutral-primary)',
					'--fgcolor-info': 'var(--fgcolor-neutral-primary)'
				},
				() => {
					if (Alert.Inline) {
						$$renderer.push('<!--[-->');

						Alert.Inline($$renderer, {
							status: 'info',
							title: 'Set up your starter kit with AI',
							dismissible: true,
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'column',
										class: 'alert-content',
										gap: 'l',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'column',
													alignItems: 'center',
													gap: 's',
													children: ($$renderer) => {
														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Copy the prompt or open it directly in an AI tool like Cursor or Lovable to get
                    step-by-step instructions, starter code, and SDK commands for your project.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											Popover($$renderer, {
												padding: 'none',
												placement: 'bottom-start',
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { toggle, showing }) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																gap: 'none',
																alignItems: 'center',
																children: ($$renderer) => {
																	Button($$renderer, {
																		secondary: true,
																		size: 's',
																		class: validOpeners().length ? 'btn-no-right-radius' : '',
																		disabled: !prompt() || prompt().length === 0,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Copy setup prompt`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	if (validOpeners().length) {
																		$$renderer.push('<!--[0-->');

																		Button($$renderer, {
																			secondary: true,
																			size: 's',
																			class: 'btn-no-left-radius',
																			icon: true,
																			ariaLabel: 'Open action menu',
																			disabled: !prompt() || prompt().length === 0,
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: showing ? IconChevronUp : IconChevronDown });
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},

													tooltip: ($$renderer, { toggle }) => {
														{
															if (ActionMenu.Root) {
																$$renderer.push('<!--[-->');

																ActionMenu.Root($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(validOpeners());

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let openerId = each_array[$$index];
																			const o = openersConfig[openerId];

																			if (o) {
																				$$renderer.push('<!--[0-->');

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						children: ($$renderer) => {
																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									direction: 'row',
																									gap: 's',
																									alignItems: 'center',
																									children: ($$renderer) => {
																										Avatar($$renderer, {
																											size: 's',
																											alt: o.alt,
																											children: ($$renderer) => {
																												if (o.icon) {
																													$$renderer.push('<!--[0-->');
																													Icon($$renderer, { icon: o.icon, size: 'l' });
																												} else if (o.imgSrc) {
																													$$renderer.push(`<!--[1--><img${$.attr('src', o.imgSrc)}${$.attr('alt', o.alt)}/>`);
																												} else {
																													$$renderer.push('<!--[-1-->');
																												}

																												$$renderer.push(`<!--]-->`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push(`<!----> `);

																										if (Layout.Stack) {
																											$$renderer.push('<!--[-->');

																											Layout.Stack($$renderer, {
																												gap: 'none',
																												children: ($$renderer) => {
																													if (Typography.Text) {
																														$$renderer.push('<!--[-->');

																														Typography.Text($$renderer, {
																															color: '--fgcolor-neutral-secondary',
																															variant: 'm-500',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->${$.escape(o.label)}`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Typography.Text) {
																														$$renderer.push('<!--[-->');

																														Typography.Text($$renderer, {
																															color: '--fgcolor-neutral-tertiary',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->${$.escape(o.description)}`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]-->`);
																		}

																		$$renderer.push(`<!--]-->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}
													}
												}
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},

							$$slots: {
								default: true,
								icon: ($$renderer) => {
									{
										IconAINotification($$renderer, {});
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				true
			);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}