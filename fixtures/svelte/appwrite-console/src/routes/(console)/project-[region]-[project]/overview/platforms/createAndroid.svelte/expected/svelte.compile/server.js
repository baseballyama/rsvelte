import * as $ from 'svelte/internal/server';
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

export default function CreateAndroid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { isConnectPlatform = false } = $$props;
		let showExitModal = false;
		let isCreatingPlatform = false;
		let connectionSuccessful = false;
		let isPlatformCreated = isConnectPlatform;
		const projectId = page.params.project;

		const VERSIONS_ENDPOINT = (() => {
			const endpoint = getApiEndpoint(page.params.region);
			const url = new URL('/versions', endpoint);

			return url.toString();
		})();

		let androidSdkVersion = '11.3.0';

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

		const alreadyExistsInstructions = $.derived(() => buildAndroidInstructions(androidSdkVersion));
		const gitCloneCode = '\ngit clone https://github.com/appwrite/starter-for-android\ncd starter-for-android\n';

		const configCode = `const val APPWRITE_PROJECT_ID = "${projectId}"
const val APPWRITE_PROJECT_NAME = "${$.store_get($$store_subs ??= {}, '$project', project).name}"
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
					androidSdkVersion = latestVersion.trim();
				}
			} catch(error) {
				console.error('Unable to fetch latest Android SDK version', error);
			}
		}

		async function createAndroidPlatform() {
			try {
				isCreatingPlatform = true;

				await sdk.forProject(page.params.region, page.params.project).project.createAndroidPlatform({
					platformId: ID.unique(),
					name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
					applicationId: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
				});

				isPlatformCreated = true;
				trackEvent(Submit.PlatformCreate, { type: 'android' });
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
			fetchAndroidSdkVersion();

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
				title: getCorrectTitle(isConnectPlatform, 'Android'),
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
								if (!isPlatformCreated) {
									$$renderer.push('<!--[0-->');

									Form($$renderer, {
										onSubmit: createAndroidPlatform,
										children: ($$renderer) => {
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
																				placeholder: 'My Android app',
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
																				id: 'key',
																				required: true,
																				label: 'Package name',
																				placeholder: 'com.company.appname',
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
																												$$renderer.push(`<!---->Your package name is generally the applicationId in your
                                        app-level build.gradle file.`);
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
																	disabled: !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name || !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key || isCreatingPlatform,
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
																				Icon($$renderer, { size: 'm', icon: IconAndroid });
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

								$$renderer.push(`<!--]--> `);

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
															platform: 'android',
															configCode,
															alreadyExistsInstructions: alreadyExistsInstructions(),
															openers: ['cursor']
														});

														$$renderer.push(`<!----> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->1. If you're starting a new project, you can clone our starter kit from
                        GitHub using the terminal, VSCode or Android Studio.`);
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
																	InlineCode($$renderer, { size: 's', code: 'constants/AppwriteConfig.kt' });
																	$$renderer.push(`<!----> and update the configuration settings.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);
														Code($$renderer, { lang: 'kotlin', lineNumbers: true, code: configCode });
														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->3. Run the app on a connected device or emulator, then click the `);
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
															OnboardingPlatformCard($$renderer, { iconSize: 2.526, iconColor: '#3ddc84', icon: IconAndroid });
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