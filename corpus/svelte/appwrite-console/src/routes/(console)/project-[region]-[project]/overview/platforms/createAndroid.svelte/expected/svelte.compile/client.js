import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Wizard } from '$lib/layout';
import { invalidate } from '$app/navigation';
import { createPlatform } from './wizard/store';
import { Dependencies } from '$lib/constants';

import {
	Code,
	Layout,
	Icon,
	Typography,
	Fieldset,
	InlineCode,
	Tooltip
} from '@appwrite.io/pink-svelte';

import { Button, Form, InputText } from '$lib/elements/forms';
import { IconAndroid, IconAppwrite, IconInfo } from '@appwrite.io/pink-icons-svelte';
import { Card } from '$lib/components';
import { page } from '$app/state';
import { onMount } from 'svelte';
import { getApiEndpoint, realtime, sdk } from '$lib/stores/sdk';
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
var root_1 = $.from_html(`2. Open the file <!> and update the configuration settings.`, 1);
var root_2 = $.from_html(`3. Run the app on a connected device or emulator, then click the <!> button to verify the setup.`, 1);
var root_3 = $.from_html(`<!> <!> <div class="pink2-code-margin-fix"><!></div> <!> <div class="pink2-code-margin-fix"><!></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="u-flex u-flex-vertical u-cross-center u-gap-8"><!> <!></div>`);

export default function CreateAndroid($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $createPlatform = () => $.store_get(createPlatform, '$createPlatform', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isConnectPlatform = $.prop($$props, 'isConnectPlatform', 3, false);
	let showExitModal = $.state(false);
	let isCreatingPlatform = $.state(false);
	let connectionSuccessful = $.state(false);
	let isPlatformCreated = $.state($.proxy(isConnectPlatform()));
	const projectId = page.params.project;

	const VERSIONS_ENDPOINT = (() => {
		const endpoint = getApiEndpoint(page.params.region);
		const url = new URL('/versions', endpoint);

		return url.toString();
	})();

	let androidSdkVersion = $.state('11.3.0');

	function buildAndroidInstructions(version) {
		return `
Confirm you're working inside the correct Android project before editing anything:
- Navigate into the directory that contains the real Android app module (look for gradlew, settings.gradle, and the app-level build.gradle(.kts)).
- If Cursor opens in a parent folder (like your home directory) or you see multiple Android projects, ask which one to modify before making changes.
- Update the app-level build.gradle.kts by default, but be ready to edit a Groovy build.gradle if the project hasn't migrated to Kotlin DSL yet.

Prefer Version Catalogs when adding the Appwrite SDK:
1. If ./gradle/libs.versions.toml exists, add or reuse an Appwrite entry:
\`\`\`toml
[libraries]
appwrite = { module = "io.appwrite:sdk-for-android", version = "${version}" }
\`\`\`
2. Reference it inside the module's dependencies block:
\`\`\`kotlin
dependencies {
    implementation(libs.appwrite)
}
\`\`\`
Only when the project lacks ./gradle/libs.versions.toml should you hardcode the dependency:
\`\`\`kotlin
implementation("io.appwrite:sdk-for-android:${version}")
\`\`\`
Legacy Groovy scripts should use:
\`\`\`groovy
implementation "io.appwrite:sdk-for-android:${version}"
\`\`\`

Before introducing any new files, search the project (app/src, libs/, shared modules, etc.) for existing Appwrite client helpers (look for \`Client(\`, \`AppwriteClient\`, or \`.setEndpoint\`). If a client already exists, update its configuration instead of creating a duplicate.

Ensure the Appwrite client is initialized with the application context and current project info:
\`\`\`kotlin
val client = Client(applicationContext)
    .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
    .setProject("${projectId}")

val account = Account(client)
\`\`\`

From the app's entry point (e.g., Application class or the first launched Activity), automatically invoke a helper that pings Appwrite so the user can verify connectivity and will be reflected on the Appwrite console:
\`\`\`kotlin
client.ping()
\`\`\`
`;
	}

	const alreadyExistsInstructions = $.derived(() => buildAndroidInstructions($.get(androidSdkVersion)));
	const gitCloneCode = '\ngit clone https://github.com/appwrite/starter-for-android\ncd starter-for-android\n';

	const configCode = `const val APPWRITE_PROJECT_ID = "${projectId}"
const val APPWRITE_PROJECT_NAME = "${$project().name}"
const val APPWRITE_PUBLIC_ENDPOINT = "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"`;

	async function fetchAndroidSdkVersion() {
		try {
			const response = await fetch(VERSIONS_ENDPOINT);

			if (!response.ok) {
				throw new Error(`Failed to fetch versions: ${response.status}`);
			}

			const data = await response.json();
			const latestVersion = data?.['client-android'];

			if (typeof latestVersion === 'string' && latestVersion.trim()) {
				$.set(androidSdkVersion, latestVersion.trim(), true);
			}
		} catch(error) {
			console.error('Unable to fetch latest Android SDK version', error);
		}
	}

	async function createAndroidPlatform() {
		try {
			$.set(isCreatingPlatform, true);

			await sdk.forProject(page.params.region, page.params.project).project.createAndroidPlatform({
				platformId: ID.unique(),
				name: $createPlatform().name,
				applicationId: $createPlatform().key
			});

			$.set(isPlatformCreated, true);
			trackEvent(Submit.PlatformCreate, { type: 'android' });
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
		fetchAndroidSdkVersion();

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
		let $1 = $.derived(() => getCorrectTitle(isConnectPlatform(), 'Android'));

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

							{
								var consequent = ($$anchor) => {
									Form($$anchor, {
										onSubmit: createAndroidPlatform,
										children: ($$anchor, $$slotProps) => {
											Fieldset($$anchor, {
												legend: 'Details',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_2 = $.first_child(fragment_5);

													$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
														Layout_Stack_1($$anchor, {
															gap: 'l',
															alignItems: 'flex-end',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_3 = $.first_child(fragment_6);

																$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																	Layout_Stack_2($$anchor, {
																		gap: 's',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var node_4 = $.first_child(fragment_7);

																			InputText(node_4, {
																				id: 'name',
																				label: 'Name',
																				placeholder: 'My Android app',
																				required: true,
																				get value() {
																					return $createPlatform().name;
																				},

																				set value($$value) {
																					$.store_mutate(createPlatform, $.untrack($createPlatform).name = $$value, $.untrack($createPlatform));
																				}
																			});

																			var node_5 = $.sibling(node_4, 2);

																			InputText(node_5, {
																				id: 'key',
																				required: true,
																				label: 'Package name',
																				placeholder: 'com.company.appname',
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
																									var fragment_10 = $.comment();
																									var node_6 = $.first_child(fragment_10);

																									$.component(node_6, () => Typography.Caption, ($$anchor, Typography_Caption) => {
																										Typography_Caption($$anchor, {
																											variant: '400',
																											slot: 'tooltip',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text = $.text('Your package name is generally the applicationId in your\n                                        app-level build.gradle file.');

																												$.append($$anchor, text);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_10);
																								}
																							}
																						});
																					}
																				}
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_7 = $.sibling(node_3, 2);

																{
																	let $0 = $.derived(() => !$createPlatform().name || !$createPlatform().key || $.get(isCreatingPlatform));

																	Button(node_7, {
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
								};

								var alternate = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_8 = $.first_child(fragment_11);

									$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
										Layout_Stack_3($$anchor, {
											gap: 'xxl',
											children: ($$anchor, $$slotProps) => {
												Card($$anchor, {
													padding: 's',
													radius: 's',
													children: ($$anchor, $$slotProps) => {
														var fragment_13 = $.comment();
														var node_9 = $.first_child(fragment_13);

														$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
															Layout_Stack_4($$anchor, {
																direction: 'row',
																justifyContent: 'space-between',
																alignItems: 'center',
																gap: 'xs',
																children: ($$anchor, $$slotProps) => {
																	var fragment_14 = $.comment();
																	var node_10 = $.first_child(fragment_14);

																	$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																		Layout_Stack_5($$anchor, {
																			direction: 'row',
																			alignItems: 'center',
																			gap: 's',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = root();
																				var node_11 = $.first_child(fragment_15);

																				Icon(node_11, {
																					size: 'm',
																					get icon() {
																						return IconAndroid;
																					}
																				});

																				var node_12 = $.sibling(node_11, 2);

																				$.component(node_12, () => Typography.Text, ($$anchor, Typography_Text) => {
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

														$.append($$anchor, fragment_13);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								};

								$.if(node_1, ($$render) => {
									if (!$.get(isPlatformCreated)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							var node_13 = $.sibling(node_1, 2);

							{
								var consequent_1 = ($$anchor) => {
									Fieldset($$anchor, {
										legend: 'Clone starter',
										badge: 'Optional',
										children: ($$anchor, $$slotProps) => {
											var fragment_18 = $.comment();
											var node_14 = $.first_child(fragment_18);

											$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
												Layout_Stack_6($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = root_3();
														var node_15 = $.first_child(fragment_19);

														LlmBanner(node_15, {
															platform: 'android',
															get configCode() {
																return configCode;
															},

															get alreadyExistsInstructions() {
																return $.get(alreadyExistsInstructions);
															},
															openers: ['cursor']
														});

														var node_16 = $.sibling(node_15, 2);

														$.component(node_16, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('1. If you\'re starting a new project, you can clone our starter kit from\n                        GitHub using the terminal, VSCode or Android Studio.');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														var div = $.sibling(node_16, 2);
														var node_17 = $.child(div);

														Code(node_17, { lang: 'bash', lineNumbers: true, code: gitCloneCode });
														$.reset(div);

														var node_18 = $.sibling(div, 2);

														$.component(node_18, () => Typography.Text, ($$anchor, Typography_Text_2) => {
															Typography_Text_2($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_20 = root_1();
																	var node_19 = $.sibling($.first_child(fragment_20));

																	InlineCode(node_19, { size: 's', code: 'constants/AppwriteConfig.kt' });
																	$.next();
																	$.append($$anchor, fragment_20);
																},
																$$slots: { default: true }
															});
														});

														var div_1 = $.sibling(node_18, 2);
														var node_20 = $.child(div_1);

														Code(node_20, {
															lang: 'kotlin',
															lineNumbers: true,
															get code() {
																return configCode;
															}
														});

														$.reset(div_1);

														var node_21 = $.sibling(div_1, 2);

														$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_3) => {
															Typography_Text_3($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_21 = root_2();
																	var node_22 = $.sibling($.first_child(fragment_21));

																	InlineCode(node_22, { size: 's', code: 'Send a ping' });
																	$.next();
																	$.append($$anchor, fragment_21);
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
								};

								$.if(node_13, ($$render) => {
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
							var fragment_23 = $.comment();
							var node_23 = $.first_child(fragment_23);

							$.component(node_23, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
								Layout_Stack_7($$anchor, {
									gap: 'xxl',
									children: ($$anchor, $$slotProps) => {
										var fragment_24 = root();
										var node_24 = $.first_child(fragment_24);

										$.component(node_24, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
											Layout_Stack_8($$anchor, {
												direction: 'row',
												justifyContent: 'center',
												gap: 'none',
												children: ($$anchor, $$slotProps) => {
													var fragment_25 = root_4();
													var node_25 = $.first_child(fragment_25);

													OnboardingPlatformCard(node_25, {
														iconSize: 2.526,
														iconColor: '#3ddc84',
														get icon() {
															return IconAndroid;
														}
													});

													var node_26 = $.sibling(node_25, 2);

													ConnectionLine(node_26, {
														get status() {
															return $.get(connectionSuccessful);
														}
													});

													var node_27 = $.sibling(node_26, 2);

													OnboardingPlatformCard(node_27, {
														iconSize: 2.526,
														iconColor: '#FD366E',
														get icon() {
															return IconAppwrite;
														}
													});

													$.append($$anchor, fragment_25);
												},
												$$slots: { default: true }
											});
										});

										var node_28 = $.sibling(node_24, 2);

										{
											var consequent_3 = ($$anchor) => {
												var fragment_26 = $.comment();
												var node_29 = $.first_child(fragment_26);

												$.component(node_29, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
													Layout_Stack_9($$anchor, {
														direction: 'row',
														justifyContent: 'center',
														alignItems: 'center',
														gap: 'l',
														children: ($$anchor, $$slotProps) => {
															var fragment_27 = $.comment();
															var node_30 = $.first_child(fragment_27);

															{
																var consequent_2 = ($$anchor) => {
																	var fragment_28 = $.comment();
																	var node_31 = $.first_child(fragment_28);

																	$.component(node_31, () => Typography.Text, ($$anchor, Typography_Text_4) => {
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

																	$.append($$anchor, fragment_28);
																};

																var alternate_1 = ($$anchor) => {
																	var div_2 = root_5();
																	var node_32 = $.child(div_2);

																	$.component(node_32, () => Typography.Title, ($$anchor, Typography_Title) => {
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

																	var node_33 = $.sibling(node_32, 2);

																	$.component(node_33, () => Typography.Text, ($$anchor, Typography_Text_5) => {
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

																$.if(node_30, ($$render) => {
																	if (!$.get(connectionSuccessful)) $$render(consequent_2); else $$render(alternate_1, -1);
																});
															}

															$.append($$anchor, fragment_27);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_26);
											};

											$.if(node_28, ($$render) => {
												if ($.get(isPlatformCreated)) $$render(consequent_3);
											});
										}

										$.append($$anchor, fragment_24);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_23);
						},
						$$slots: { default: true }
					});
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_29 = $.comment();
					var node_34 = $.first_child(fragment_29);

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

						$.if(node_34, ($$render) => {
							if ($.get(isPlatformCreated)) $$render(consequent_4);
						});
					}

					$.append($$anchor, fragment_29);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}