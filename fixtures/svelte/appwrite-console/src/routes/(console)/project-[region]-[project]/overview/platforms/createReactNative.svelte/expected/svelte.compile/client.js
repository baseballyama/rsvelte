import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`2. Add your Appwrite credentials to <!> then rename it to <!> if needed.`, 1);
var root_2 = $.from_html(`3. Run the app on a connected device or simulator using <!> followed by <!>, then click the <!> button to verify the setup.`, 1);
var root_3 = $.from_html(`<!> <!> <div class="pink2-code-margin-fix"><!></div> <!> <div class="pink2-code-margin-fix"><!></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="u-flex u-flex-vertical u-cross-center u-gap-8"><!> <!></div>`);

export default function CreateReactNative($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $createPlatform = () => $.store_get(createPlatform, '$createPlatform', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];

	let isConnectPlatform = $.prop($$props, 'isConnectPlatform', 3, false),
		platform = $.prop($$props, 'platform', 7, 'react-native-android');

	let showExitModal = $.state(false);
	let isCreatingPlatform = $.state(false);
	let connectionSuccessful = $.state(false);
	let isPlatformCreated = $.state($.proxy(isConnectPlatform()));
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
EXPO_PUBLIC_APPWRITE_PROJECT_NAME="${$project().name}"
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
			$.set(isCreatingPlatform, true);

			const projectSdk = sdk.forProject(page.params.region, page.params.project).project;

			if (platform() === 'react-native-android') {
				await projectSdk.createAndroidPlatform({
					platformId: ID.unique(),
					name: $createPlatform().name,
					applicationId: $createPlatform().key
				});
			} else {
				await projectSdk.createApplePlatform({
					platformId: ID.unique(),
					name: $createPlatform().name,
					bundleIdentifier: $createPlatform().key
				});
			}

			$.set(isPlatformCreated, true);
			trackEvent(Submit.PlatformCreate, { type: platform() });
			addNotification({ type: 'success', message: 'Platform created.' });
			await invalidate(Dependencies.PROJECT);
		} catch(error) {
			trackError(error, Submit.PlatformCreate);
			addNotification({ type: 'error', message: error.message });
		} finally {
			$.set(isCreatingPlatform, false);
		}
	}

	async function resetPlatformStore() {
		createPlatform.reset();
	}

	onMount(() => {
		const unsubscribe = realtime.forConsole(page.params.region, 'console', (response) => {
			if (response.events.includes(`projects.${projectId}.ping`)) {
				$.set(connectionSuccessful, true);
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

	{
		let $0 = $.derived(() => !$.get(isPlatformCreated));
		let $1 = $.derived(() => getCorrectTitle(isConnectPlatform(), 'React Native'));

		Wizard($$anchor, {
			get confirmExit() {
				return $.get($0);
			},

			get title() {
				return $.get($1);
			},

			get showExitModal() {
				return $.get(showExitModal);
			},

			set showExitModal($$value) {
				$.set(showExitModal, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						gap: 'xxl',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							Form(node_1, {
								onSubmit: createReactNativePlatform,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 'xxl',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
													Layout_Stack_2($$anchor, {
														gap: 'l',
														direction: 'row',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_4 = $.first_child(fragment_5);

															$.each(node_4, 17, () => Object.entries(platforms), $.index, ($$anchor, $$item) => {
																var $$array = $.derived(() => $.to_array($.get($$item), 2));
																let key = () => $.get($$array)[0];
																let value = () => $.get($$array)[1];
																var fragment_6 = $.comment();
																var node_5 = $.first_child(fragment_6);

																{
																	let $0 = $.derived(() => $.get(isCreatingPlatform) || $.get(isPlatformCreated));

																	$.component(node_5, () => Pink2Card.Selector, ($$anchor, Pink2Card_Selector) => {
																		Pink2Card_Selector($$anchor, {
																			get value() {
																				return value();
																			},

																			get id() {
																				return key();
																			},

																			get title() {
																				return key();
																			},
																			imageRadius: 's',
																			name: 'framework',
																			get disabled() {
																				return $.get($0);
																			},

																			get group() {
																				return platform();
																			},

																			set group($$value) {
																				platform($$value);
																			}
																		});
																	});
																}

																$.append($$anchor, fragment_6);
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_3, 2);

												{
													var consequent = ($$anchor) => {
														Fieldset($$anchor, {
															legend: 'Details',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_7 = $.first_child(fragment_8);

																$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																	Layout_Stack_3($$anchor, {
																		gap: 'l',
																		alignItems: 'flex-end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = root();
																			var node_8 = $.first_child(fragment_9);

																			$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																				Layout_Stack_4($$anchor, {
																					gap: 's',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root();
																						var node_9 = $.first_child(fragment_10);

																						InputText(node_9, {
																							id: 'name',
																							label: 'Name',
																							get placeholder() {
																								return placeholder[platform()].name;
																							},
																							required: true,
																							get value() {
																								return $createPlatform().name;
																							},

																							set value($$value) {
																								$.store_mutate(createPlatform, $.untrack($createPlatform).name = $$value, $.untrack($createPlatform));
																							}
																						});

																						var node_10 = $.sibling(node_9, 2);

																						InputText(node_10, {
																							id: 'hostname',
																							get label() {
																								return hostnameLabel[platform()];
																							},

																							get placeholder() {
																								return placeholder[platform()].hostname;
																							},
																							required: true,
																							get value() {
																								return $createPlatform().key;
																							},

																							set value($$value) {
																								$.store_mutate(createPlatform, $.untrack($createPlatform).key = $$value, $.untrack($createPlatform));
																							},

																							$$slots: {
																								info: ($$anchor, $$slotProps) => {
																									Tooltip($$anchor, {
																										slot: 'info',
																										maxWidth: '15rem',
																										children: ($$anchor, $$slotProps) => {
																											Icon($$anchor, {
																												get icon() {
																													return IconInfo;
																												},
																												size: 's'
																											});
																										},

																										$$slots: {
																											default: true,
																											tooltip: ($$anchor, $$slotProps) => {
																												var fragment_13 = $.comment();
																												var node_11 = $.first_child(fragment_13);

																												$.component(node_11, () => Typography.Caption, ($$anchor, Typography_Caption) => {
																													Typography_Caption($$anchor, {
																														variant: '400',
																														slot: 'tooltip',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text = $.text();

																															$.template_effect(() => $.set_text(text, placeholder[platform()].tooltip));
																															$.append($$anchor, text);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_13);
																											}
																										}
																									});
																								}
																							}
																						});

																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_12 = $.sibling(node_8, 2);

																			{
																				let $0 = $.derived(() => !platform() || !$createPlatform().name || !$createPlatform().key || $.get(isCreatingPlatform));

																				Button(node_12, {
																					fullWidthMobile: true,
																					size: 's',
																					submit: true,
																					forceShowLoader: true,
																					get submissionLoader() {
																						return $.get(isCreatingPlatform);
																					},

																					get disabled() {
																						return $.get($0);
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_1 = $.text('Create platform');

																						$.append($$anchor, text_1);
																					},
																					$$slots: { default: true }
																				});
																			}

																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													};

													var alternate = ($$anchor) => {
														var fragment_15 = $.comment();
														var node_13 = $.first_child(fragment_15);

														$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
															Layout_Stack_5($$anchor, {
																gap: 'xxl',
																children: ($$anchor, $$slotProps) => {
																	Card($$anchor, {
																		padding: 's',
																		radius: 's',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_17 = $.comment();
																			var node_14 = $.first_child(fragment_17);

																			$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																				Layout_Stack_6($$anchor, {
																					direction: 'row',
																					justifyContent: 'space-between',
																					alignItems: 'center',
																					gap: 'xs',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_18 = $.comment();
																						var node_15 = $.first_child(fragment_18);

																						$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																							Layout_Stack_7($$anchor, {
																								direction: 'row',
																								alignItems: 'center',
																								gap: 's',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_19 = root();
																									var node_16 = $.first_child(fragment_19);

																									Icon(node_16, {
																										size: 'm',
																										get icon() {
																											return IconReact;
																										}
																									});

																									var node_17 = $.sibling(node_16, 2);

																									$.component(node_17, () => Typography.Text, ($$anchor, Typography_Text) => {
																										Typography_Text($$anchor, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-primary',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text();

																												$.template_effect(() => $.set_text(text_2, `${$createPlatform().name ?? ''} (${$createPlatform().key ?? ''})`));
																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_19);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_18);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_17);
																		},
																		$$slots: { default: true }
																	});
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_15);
													};

													$.if(node_6, ($$render) => {
														if (!$.get(isPlatformCreated)) $$render(consequent); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_1, 2);

							{
								var consequent_1 = ($$anchor) => {
									Fieldset($$anchor, {
										legend: 'Clone starter',
										badge: 'Optional',
										children: ($$anchor, $$slotProps) => {
											var fragment_22 = $.comment();
											var node_19 = $.first_child(fragment_22);

											$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
												Layout_Stack_8($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_23 = root_3();
														var node_20 = $.first_child(fragment_23);

														LlmBanner(node_20, {
															platform: 'reactnative',
															get configCode() {
																return promptConfigCode;
															},

															get alreadyExistsInstructions() {
																return alreadyExistsInstructions;
															},
															openers: ['cursor']
														});

														var node_21 = $.sibling(node_20, 2);

														$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('1. If you\'re starting a new project, you can clone our starter kit from\n                        GitHub using the terminal or VSCode.');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														var div = $.sibling(node_21, 2);
														var node_22 = $.child(div);

														Code(node_22, { lang: 'bash', lineNumbers: true, code: gitCloneCode });
														$.reset(div);

														var node_23 = $.sibling(div, 2);

														$.component(node_23, () => Typography.Text, ($$anchor, Typography_Text_2) => {
															Typography_Text_2($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_24 = root_1();
																	var node_24 = $.sibling($.first_child(fragment_24));

																	InlineCode(node_24, { size: 's', code: '.env.example' });

																	var node_25 = $.sibling(node_24, 2);

																	InlineCode(node_25, { size: 's', code: '.env' });
																	$.next();
																	$.append($$anchor, fragment_24);
																},
																$$slots: { default: true }
															});
														});

														var div_1 = $.sibling(node_23, 2);
														var node_26 = $.child(div_1);

														Code(node_26, {
															lang: 'dotenv',
															lineNumbers: true,
															get code() {
																return updateConfigCode;
															}
														});

														$.reset(div_1);

														var node_27 = $.sibling(div_1, 2);

														$.component(node_27, () => Typography.Text, ($$anchor, Typography_Text_3) => {
															Typography_Text_3($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_25 = root_2();
																	var node_28 = $.sibling($.first_child(fragment_25));

																	InlineCode(node_28, { size: 's', code: 'npm install' });

																	var node_29 = $.sibling(node_28, 2);

																	{
																		let $0 = $.derived(() => platform() === 'react-native-ios' ? 'npm run ios' : 'npm run android');

																		InlineCode(node_29, {
																			size: 's',
																			get code() {
																				return $.get($0);
																			}
																		});
																	}

																	var node_30 = $.sibling(node_29, 2);

																	InlineCode(node_30, { size: 's', code: 'Send a ping' });
																	$.next();
																	$.append($$anchor, fragment_25);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_22);
										},
										$$slots: { default: true }
									});
								};

								$.if(node_18, ($$render) => {
									if ($.get(isPlatformCreated)) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				aside: ($$anchor, $$slotProps) => {
					Card($$anchor, {
						padding: 'l',
						class: 'responsive-padding',
						children: ($$anchor, $$slotProps) => {
							var fragment_27 = $.comment();
							var node_31 = $.first_child(fragment_27);

							$.component(node_31, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
								Layout_Stack_9($$anchor, {
									gap: 'xxl',
									children: ($$anchor, $$slotProps) => {
										var fragment_28 = root();
										var node_32 = $.first_child(fragment_28);

										$.component(node_32, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
											Layout_Stack_10($$anchor, {
												direction: 'row',
												justifyContent: 'center',
												gap: 'none',
												children: ($$anchor, $$slotProps) => {
													var fragment_29 = root_4();
													var node_33 = $.first_child(fragment_29);

													OnboardingPlatformCard(node_33, {
														iconSize: 2.526,
														iconColor: '#61DBFB',
														get icon() {
															return IconReact;
														}
													});

													var node_34 = $.sibling(node_33, 2);

													ConnectionLine(node_34, {
														get status() {
															return $.get(connectionSuccessful);
														}
													});

													var node_35 = $.sibling(node_34, 2);

													OnboardingPlatformCard(node_35, {
														iconSize: 2.526,
														iconColor: '#FD366E',
														get icon() {
															return IconAppwrite;
														}
													});

													$.append($$anchor, fragment_29);
												},
												$$slots: { default: true }
											});
										});

										var node_36 = $.sibling(node_32, 2);

										{
											var consequent_3 = ($$anchor) => {
												var fragment_30 = $.comment();
												var node_37 = $.first_child(fragment_30);

												$.component(node_37, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
													Layout_Stack_11($$anchor, {
														direction: 'row',
														justifyContent: 'center',
														alignItems: 'center',
														gap: 'l',
														children: ($$anchor, $$slotProps) => {
															var fragment_31 = $.comment();
															var node_38 = $.first_child(fragment_31);

															{
																var consequent_2 = ($$anchor) => {
																	var fragment_32 = $.comment();
																	var node_39 = $.first_child(fragment_32);

																	$.component(node_39, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																		Typography_Text_4($$anchor, {
																			variant: 'm-400',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text('Waiting for connection...');

																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_32);
																};

																var alternate_1 = ($$anchor) => {
																	var div_2 = root_5();
																	var node_40 = $.child(div_2);

																	$.component(node_40, () => Typography.Title, ($$anchor, Typography_Title) => {
																		Typography_Title($$anchor, {
																			size: 'm',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Congratulations!');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_41 = $.sibling(node_40, 2);

																	$.component(node_41, () => Typography.Text, ($$anchor, Typography_Text_5) => {
																		Typography_Text_5($$anchor, {
																			variant: 'm-400',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_6 = $.text('You connected your app successfully.');

																				$.append($$anchor, text_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.reset(div_2);
																	$.transition(1, div_2, () => fade, () => ({ duration: 2500 }));
																	$.append($$anchor, div_2);
																};

																$.if(node_38, ($$render) => {
																	if (!$.get(connectionSuccessful)) $$render(consequent_2); else $$render(alternate_1, -1);
																});
															}

															$.append($$anchor, fragment_31);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_30);
											};

											$.if(node_36, ($$render) => {
												if ($.get(isPlatformCreated)) $$render(consequent_3);
											});
										}

										$.append($$anchor, fragment_28);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_27);
						},
						$$slots: { default: true }
					});
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_33 = $.comment();
					var node_42 = $.first_child(fragment_33);

					{
						var consequent_4 = ($$anchor) => {
							Button($$anchor, {
								size: 's',
								fullWidthMobile: true,
								secondary: true,
								get disabled() {
									return $.get(isCreatingPlatform);
								},
								href: location.pathname,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Skip, go to dashboard');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_42, ($$render) => {
							if ($.get(isPlatformCreated)) $$render(consequent_4);
						});
					}

					$.append($$anchor, fragment_33);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}