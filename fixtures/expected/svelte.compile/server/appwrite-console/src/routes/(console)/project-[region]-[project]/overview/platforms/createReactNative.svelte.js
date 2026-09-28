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
import { IconReact, IconAppwrite, IconInfo } from '@appwrite.io/pink-icons-svelte';
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
import { project } from '../../store';
import { getCorrectTitle } from './store';
import LlmBanner from './llmBanner.svelte';

export default function CreateReactNative($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { isConnectPlatform = false, platform = 'react-native-android' } = $$props;
		let showExitModal = false;
		let isCreatingPlatform = false;
		let connectionSuccessful = false;
		let isPlatformCreated = isConnectPlatform;
		const projectId = page.params.project;

		const alreadyExistsInstructions = `
Install the Appwrite React Native SDK using the following command, respect user's package manager of choice and use the one being used in the codebase:

\`\`\`
npx expo install react-native-appwrite react-native-url-polyfill
\`\`\`

From a suitable lib directory, export the Appwrite client as a global variable, hardcode the project details too:

\`\`\`
const client = new Client()
    .setProject("${projectId}")
    .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}");
\`\`\`

From the entrypoint of the app, make it so that the following function is automatically called which will ping the Appwrite backend server to verify the setup. Let the user know about this function being added

\`\`\`
client.ping();
\`\`\`
    `;

		const gitCloneCode = '\ngit clone https://github.com/appwrite/starter-for-react-native\ncd starter-for-react-native\n';

		const updateConfigCode = `EXPO_PUBLIC_APPWRITE_PROJECT_ID=${projectId}
EXPO_PUBLIC_APPWRITE_PROJECT_NAME="${$.store_get($$store_subs ??= {}, '$project', project).name}"
EXPO_PUBLIC_APPWRITE_ENDPOINT=${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}`;

		const promptConfigCode = `
    const client = new Client()
        .setProject("${projectId}")
        .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
    `;

		let platforms = { Android: 'react-native-android', iOS: 'react-native-ios' };

		const placeholder = {
			'react-native-android': {
				name: 'My Android App',
				hostname: 'com.company.appname',
				tooltip: 'Your package name is generally the applicationId in your app-level build.gradle file.'
			},
			'react-native-ios': {
				name: 'My iOS App',
				hostname: 'com.company.appname',
				tooltip: "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
			}
		};

		const hostnameLabel = {
			'react-native-android': 'Package name',
			'react-native-ios': 'Bundle ID'
		};

		async function createReactNativePlatform() {
			try {
				isCreatingPlatform = true;

				const projectSdk = sdk.forProject(page.params.region, page.params.project).project;

				if (platform === 'react-native-android') {
					await projectSdk.createAndroidPlatform({
						platformId: ID.unique(),
						name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
						applicationId: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
					});
				} else {
					await projectSdk.createApplePlatform({
						platformId: ID.unique(),
						name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
						bundleIdentifier: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
					});
				}

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
				title: getCorrectTitle(isConnectPlatform, 'React Native'),
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
									onSubmit: createReactNativePlatform,
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xxl',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'l',
															direction: 'row',
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
																							placeholder: placeholder[platform].name,
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
																							label: hostnameLabel[platform],
																							placeholder: placeholder[platform].hostname,
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
																															$$renderer.push(`<!---->${$.escape(placeholder[platform].tooltip)}`);
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
																									Icon($$renderer, { size: 'm', icon: IconReact });
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
															platform: 'reactnative',
															configCode: promptConfigCode,
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
                        GitHub using the terminal or VSCode.`);
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
																	$$renderer.push(`<!---->2. Add your Appwrite credentials to `);
																	InlineCode($$renderer, { size: 's', code: '.env.example' });
																	$$renderer.push(`<!----> then rename it to `);
																	InlineCode($$renderer, { size: 's', code: '.env' });
																	$$renderer.push(`<!----> if needed.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);
														Code($$renderer, { lang: 'dotenv', lineNumbers: true, code: updateConfigCode });
														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->3. Run the app on a connected device or simulator using `);
																	InlineCode($$renderer, { size: 's', code: 'npm install' });
																	$$renderer.push(`<!----> followed by `);

																	InlineCode($$renderer, {
																		size: 's',
																		code: platform === 'react-native-ios' ? 'npm run ios' : 'npm run android'
																	});

																	$$renderer.push(`<!---->, then click the `);
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
															OnboardingPlatformCard($$renderer, { iconSize: 2.526, iconColor: '#61DBFB', icon: IconReact });
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