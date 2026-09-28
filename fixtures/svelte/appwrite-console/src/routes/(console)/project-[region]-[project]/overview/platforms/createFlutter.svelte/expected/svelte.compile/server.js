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
import { IconFlutter, IconAppwrite, IconInfo } from '@appwrite.io/pink-icons-svelte';
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

export default function CreateFlutter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { isConnectPlatform = false, platform = 'flutter-android' } = $$props;
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

		let flutterSdkVersion = '20.3.0';

		function buildFlutterInstructions(version) {
			return `
Install the Appwrite Flutter SDK using the following command:

\`\`\`
flutter pub add appwrite:${version}
\`\`\`

From a suitable lib directory, export the Appwrite client as a global variable, hardcode the project details too:

\`\`\`
final Client client = Client()
  .setProject("${projectId}")
  .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}");
\`\`\`

On the homepage of the app, create a button that says "Send a ping" and when clicked, it should call the following function:

\`\`\`
client.ping();
\`\`\`
        `;
		}

		const alreadyExistsInstructions = $.derived(() => buildFlutterInstructions(flutterSdkVersion));
		const gitCloneCode = '\ngit clone https://github.com/appwrite/starter-for-flutter\ncd starter-for-flutter\n';

		const configCode = `class Environment {
  static const String appwriteProjectId = '${projectId}';
  static const String appwriteProjectName = '${$.store_get($$store_subs ??= {}, '$project', project).name}';
  static const String appwritePublicEndpoint = '${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}';
}`;

		let platforms = {
			Android: 'flutter-android',
			iOS: 'flutter-ios',
			Linux: 'flutter-linux',
			macOS: 'flutter-macos',
			Windows: 'flutter-windows',
			Web: 'flutter-web'
		};

		const placeholder = {
			'flutter-android': {
				name: 'My Android app',
				hostname: 'com.company.appname',
				tooltip: 'Your package name is generally the applicationId in your app-level build.gradle file.'
			},
			'flutter-ios': {
				name: 'My iOS app',
				hostname: 'com.company.appname',
				tooltip: "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
			},
			'flutter-linux': {
				name: 'My Linux app',
				hostname: 'appname',
				tooltip: 'Your application name'
			},
			'flutter-macos': {
				name: 'My mac OS app',
				hostname: 'com.company.appname',
				tooltip: "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
			},
			'flutter-windows': {
				name: 'My Windows app',
				hostname: 'appname',
				tooltip: 'Your application name'
			},
			'flutter-web': {
				name: 'My Web app',
				hostname: 'localhost',
				tooltip: 'The hostname that your website will use to interact with the Appwrite APIs in production or development environments. No protocol or port number required.'
			}
		};

		const hostnameLabel = {
			'flutter-android': 'Package name',
			'flutter-ios': 'Bundle ID',
			'flutter-linux': 'Package name',
			'flutter-macos': 'Bundle ID',
			'flutter-web': 'Hostname',
			'flutter-windows': 'Package name'
		};

		async function fetchFlutterSdkVersion() {
			try {
				const response = await fetch(VERSIONS_ENDPOINT);

				if (!response.ok) {
					throw new Error(`Failed to fetch versions: ${response.status}`);
				}

				const data = await response.json();
				const latestVersion = data?.['client-flutter'];

				if (typeof latestVersion === 'string' && latestVersion.trim()) {
					flutterSdkVersion = latestVersion.trim();
				}
			} catch(error) {
				console.error('Unable to fetch latest Flutter SDK version', error);
			}
		}

		async function createFlutterPlatform() {
			try {
				isCreatingPlatform = true;

				const projectSdk = sdk.forProject(page.params.region, page.params.project).project;
				const platformId = ID.unique();

				switch (platform) {
					case 'flutter-android':
						await projectSdk.createAndroidPlatform({
							platformId,
							name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
							applicationId: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
						});
						break;

					case 'flutter-ios':

					case 'flutter-macos':
						await projectSdk.createApplePlatform({
							platformId,
							name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
							bundleIdentifier: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
						});
						break;

					case 'flutter-linux':
						await projectSdk.createLinuxPlatform({
							platformId,
							name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
							packageName: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
						});
						break;

					case 'flutter-windows':
						await projectSdk.createWindowsPlatform({
							platformId,
							name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
							packageIdentifierName: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key
						});
						break;

					case 'flutter-web':
						await projectSdk.createWebPlatform({
							platformId,
							name: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name,
							hostname: $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).hostname || undefined
						});
						break;

					default:
						throw new Error(`Unknown platform type: ${platform}`);
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
			fetchFlutterSdkVersion();

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
				title: getCorrectTitle(isConnectPlatform, 'Flutter'),
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
									onSubmit: createFlutterPlatform,
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
															columns: 3,
															columnsXS: 2,
															columnsXXS: 1,
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

																						if (platform === 'flutter-web') {
																							$$renderer.push('<!--[0-->');

																							InputText($$renderer, {
																								id: 'hostname',
																								label: hostnameLabel[platform],
																								placeholder: placeholder[platform].hostname,
																								required: true,
																								get value() {
																									return $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).hostname;
																								},

																								set value($$value) {
																									$.store_mutate($$store_subs ??= {}, '$createPlatform', createPlatform, $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).hostname = $$value);
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
																						} else {
																							$$renderer.push('<!--[-1-->');

																							InputText($$renderer, {
																								id: 'key',
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

																			Button($$renderer, {
																				fullWidthMobile: true,
																				size: 's',
																				submit: true,
																				forceShowLoader: true,
																				submissionLoader: isCreatingPlatform,
																				disabled: !platform || !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name || !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key && !$.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).hostname || isCreatingPlatform,
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
																									Icon($$renderer, { size: 'm', icon: IconFlutter });
																									$$renderer.push(`<!----> `);

																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-primary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).name)} (${$.escape($.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).hostname || $.store_get($$store_subs ??= {}, '$createPlatform', createPlatform).key)})`);
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
															platform: 'flutter',
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
																	$$renderer.push(`<!---->2. Replace `);
																	InlineCode($$renderer, { size: 's', code: 'lib/config/environment.dart' });
																	$$renderer.push(`<!----> to reflect the values below:`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);
														Code($$renderer, { lang: 'dart', lineNumbers: true, code: configCode });
														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->3. Run the app on a connected device or simulator using `);
																	InlineCode($$renderer, { size: 's', code: 'flutter run -d [device_name]' });
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
															OnboardingPlatformCard($$renderer, { iconSize: 2.526, iconColor: '#47C5FB', icon: IconFlutter });
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