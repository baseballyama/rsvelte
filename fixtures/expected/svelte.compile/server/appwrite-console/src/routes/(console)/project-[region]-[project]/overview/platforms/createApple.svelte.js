import * as $ from 'svelte/internal/server';
import { Wizard } from '$lib/layout';
import { invalidate } from '$app/navigation';
import { createPlatform } from './wizard/store';
import { Dependencies } from '$lib/constants';

import {
	Card as Pink2Card,
	Code,
	Layout,
	Icon,
	Typography,
	Fieldset,
	InlineCode,
	Tooltip
} from '@appwrite.io/pink-svelte';

import { Button, Form, InputText } from '$lib/elements/forms';
import { IconApple, IconAppwrite, IconInfo } from '@appwrite.io/pink-icons-svelte';
import { Card } from '$lib/components';
import { page } from '$app/state';
import { onMount } from 'svelte';
import { realtime, sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { fade } from 'svelte/transition';
import ConnectionLine from './components/ConnectionLine.svelte';
import OnboardingPlatformCard from './components/OnboardingPlatformCard.svelte';
import { ID } from '@appwrite.io/console';
import { app } from '$lib/stores/app';
import { project } from '../../store';
import { getCorrectTitle } from './store';
import LlmBanner from './llmBanner.svelte';

export default function CreateApple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { isConnectPlatform = false, platform = 'apple-ios' } = $$props;
		let showExitModal = false;
		let isCreatingPlatform = false;
		let connectionSuccessful = false;
		let isPlatformCreated = isConnectPlatform;
		const projectId = page.params.project;

		const alreadyExistsInstructions = `
Install the Appwrite iOS SDK using the following package URL:

\`\`\`
https://github.com/appwrite/sdk-for-apple
\`\`\`

From a suitable lib directory, export the Appwrite client as a global variable:

\`\`\`
let client = Client()
    .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
    .setProject("${projectId}")

let account = Account(client)
\`\`\`

On the homepage of the app, create a button that says "Send a ping" and when clicked, it should call the following function:

\`\`\`
client.ping()
\`\`\`
`;

		const gitCloneCode = '\ngit clone https://github.com/appwrite/starter-for-ios\ncd starter-for-ios\n';

		const configCode = `APPWRITE_PROJECT_ID: "${projectId}"
APPWRITE_PROJECT_NAME: "${$.store_get($$store_subs ??= {}, '$project', project).name}"
APPWRITE_PUBLIC_ENDPOINT: "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"`;

		const platforms = {
			iOS: 'apple-ios',
			macOS: 'apple-macos',
			watchOS: 'apple-watchos',
			tvOS: 'apple-tvos'
		};

		async function createApplePlatform() {
			try {
				isCreatingPlatform = true;

				await sdk.forProject(page.params.region, page.params.project).project.createApplePlatform({
					platformId: ID.unique(),
					name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
					bundleIdentifier: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
				});

				isPlatformCreated = true;
				trackEvent(Submit.PlatformCreate, { type: platform });
				addNotification({ type: 'success', message: 'Platform created.' });
				await invalidate(Dependencies.PROJECT);
			} catch(error) {
				trackError(error, Submit.PlatformCreate);
				addNotification({ type: 'error', message: error.message });
			} finally {
				isCreatingPlatform = false;
			}
		}

		async function resetPlatformStore() {
			createPlatform.reset();
		}

		onMount(() => {
			const unsubscribe = realtime.forConsole(page.params.region, 'console', (response) => {
				if (response.events.includes(`projects.${projectId}.ping`)) {
					connectionSuccessful = true;
					invalidate(Dependencies.ORGANIZATION);
					invalidate(Dependencies.PROJECT);
					unsubscribe();
				}
			});

			return () => {
				unsubscribe();
				resetPlatformStore();
			};
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				confirmExit: !isPlatformCreated,
				title: getCorrectTitle(isConnectPlatform, 'Apple'),
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'xxl',
							children: ($$renderer) => {
								Form($$renderer, {
									onSubmit: createApplePlatform,
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xxl',
												children: ($$renderer) => {
													if (Layout.Grid) {
														$$renderer.push('<!--[-->');

														Layout.Grid($$renderer, {
															gap: 'l',
															rowGap: 'l',
															columns: 4,
															columnsXS: 2,
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(Object.entries(platforms));

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let [key, value] = each_array[$$index];

																	if (Pink2Card.Selector) {
																		$$renderer.push('<!--[-->');

																		Pink2Card.Selector($$renderer, {
																			value,
																			id: key,
																			title: key,
																			imageRadius: 's',
																			name: 'framework',
																			disabled: isCreatingPlatform || isPlatformCreated,
																			get group() {
																				return platform;
																			},

																			set group($$value) {
																				platform = $$value;
																				$$settled = false;
																			}
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
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

													$$renderer.push(` `);

													if (!isPlatformCreated) {
														$$renderer.push('<!--[0-->');

														Fieldset($$renderer, {
															legend: 'Details',
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		gap: 'l',
																		alignItems: 'flex-end',
																		children: ($$renderer) => {
																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 's',
																					children: ($$renderer) => {
																						InputText($$renderer, {
																							id: 'name',
																							label: 'Name',
																							placeholder: 'My Apple App',
																							required: true,
																							get value() {
																								return $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name;
																							},

																							set value($$value) {
																								$.store_mutate($$store_subs ??= {}, '$createPlatform', createPlatform, $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name = $$value);
																								$$settled = false;
																							}
																						});

																						$$renderer.push(`<!----> `);

																						InputText($$renderer, {
																							id: 'hostname',
																							label: 'Bundle ID',
																							placeholder: 'com.company.appname',
																							required: true,
																							get value() {
																								return $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key;
																							},

																							set value($$value) {
																								$.store_mutate($$store_subs ??= {}, '$createPlatform', createPlatform, $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key = $$value);
																								$$settled = false;
																							},

																							$$slots: {
																								info: ($$renderer) => {
																									Tooltip($$renderer, {
																										slot: 'info',
																										maxWidth: '15rem',
																										children: ($$renderer) => {
																											Icon($$renderer, { icon: IconInfo, size: 's' });
																										},

																										$$slots: {
																											default: true,
																											tooltip: ($$renderer) => {
																												if (Typography.Caption) {
																													$$renderer.push('<!--[-->');

																													Typography.Caption($$renderer, {
																														variant: '400',
																														slot: 'tooltip',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->You can find your Bundle Identifier in the General tab
                                            for your app's primary target in Xcode.`);
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
																									});
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

																			$$renderer.push(` `);

																			Button($$renderer, {
																				fullWidthMobile: true,
																				size: 's',
																				submit: true,
																				forceShowLoader: true,
																				submissionLoader: isCreatingPlatform,
																				disabled: !platform || !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name || !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key || isCreatingPlatform,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Create platform`);
																				},
																				$$slots: { default: true }
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
															$$slots: { default: true }
														});
													} else {
														$$renderer.push('<!--[-1-->');

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xxl',
																children: ($$renderer) => {
																	Card($$renderer, {
																		padding: 's',
																		radius: 's',
																		children: ($$renderer) => {
																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					justifyContent: 'space-between',
																					alignItems: 'center',
																					gap: 'xs',
																					children: ($$renderer) => {
																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								direction: 'row',
																								alignItems: 'center',
																								gap: 's',
																								children: ($$renderer) => {
																									Icon($$renderer, { size: 'm', icon: IconApple });
																									$$renderer.push(`<!----> `);

																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-primary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name)} (${$.escape($.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key)})`);
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
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (isPlatformCreated) {
									$$renderer.push('<!--[0-->');

									Fieldset($$renderer, {
										legend: 'Clone starter',
										badge: 'Optional',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'l',
													children: ($$renderer) => {
														LlmBanner($$renderer, {
															platform: 'apple',
															configCode,
															alreadyExistsInstructions,
															openers: ['cursor']
														});

														$$renderer.push(`<!----> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->1. If you're starting a new project, you can clone our starter kit from
                        GitHub using the terminal or XCode.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);
														Code($$renderer, { lang: 'bash', lineNumbers: true, code: gitCloneCode });
														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->2. Open the file `);
																	InlineCode($$renderer, { size: 's', code: 'Sources/Config.plist' });

																	$$renderer.push(`<!----> and update
                        the configuration settings.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);
														Code($$renderer, { lang: 'plaintext', lineNumbers: true, code: configCode });
														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->3. Run the app on a connected device or simulator, then click the `);
																	InlineCode($$renderer, { size: 's', code: 'Send a ping' });
																	$$renderer.push(`<!----> button to verify the setup.`);
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

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							Card($$renderer, {
								padding: 'l',
								class: 'responsive-padding',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxl',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														justifyContent: 'center',
														gap: 'none',
														children: ($$renderer) => {
															OnboardingPlatformCard($$renderer, {
																iconSize: 2.526,
																iconColor: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'light' ? '#000' : '#fff',
																icon: IconApple
															});

															$$renderer.push(`<!----> `);
															ConnectionLine($$renderer, { status: connectionSuccessful });
															$$renderer.push(`<!----> `);
															OnboardingPlatformCard($$renderer, { iconSize: 2.526, iconColor: '#FD366E', icon: IconAppwrite });
															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (isPlatformCreated) {
													$$renderer.push('<!--[0-->');

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															justifyContent: 'center',
															alignItems: 'center',
															gap: 'l',
															children: ($$renderer) => {
																if (!connectionSuccessful) {
																	$$renderer.push('<!--[0-->');

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-400',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Waiting for connection...`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else {
																	$$renderer.push(`<!--[-1--><div class="u-flex u-flex-vertical u-cross-center u-gap-8">`);

																	if (Typography.Title) {
																		$$renderer.push('<!--[-->');

																		Typography.Title($$renderer, {
																			size: 'm',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Congratulations!`);
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
																			variant: 'm-400',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->You connected your app successfully.`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(`</div>`);
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
								$$slots: { default: true }
							});
						}
					},

					footer: ($$renderer) => {
						{
							if (isPlatformCreated) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									size: 's',
									fullWidthMobile: true,
									secondary: true,
									disabled: isCreatingPlatform,
									href: location.pathname,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Skip, go to dashboard`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}