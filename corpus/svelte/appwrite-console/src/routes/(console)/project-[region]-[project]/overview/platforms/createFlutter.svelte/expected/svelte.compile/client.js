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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`2. Replace <!> to reflect the values below:`, 1);
var root_2 = $.from_html(`3. Run the app on a connected device or simulator using <!>, then click the <!> button to verify the setup.`, 1);
var root_3 = $.from_html(`<!> <!> <div class="pink2-code-margin-fix"><!></div> <!> <div class="pink2-code-margin-fix"><!></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="u-flex u-flex-vertical u-cross-center u-gap-8"><!> <!></div>`);

export default function CreateFlutter($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $createPlatform = () => $.store_get(createPlatform, '$createPlatform', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];

	let isConnectPlatform = $.prop($$props, 'isConnectPlatform', 3, false),
		platform = $.prop($$props, 'platform', 7, 'flutter-android');

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

	let flutterSdkVersion = $.state('20.3.0');

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

	const alreadyExistsInstructions = $.derived(() => buildFlutterInstructions($.get(flutterSdkVersion)));
	const gitCloneCode = '\ngit clone https://github.com/appwrite/starter-for-flutter\ncd starter-for-flutter\n';

	const configCode = `class Environment {
  static const String appwriteProjectId = '${projectId}';
  static const String appwriteProjectName = '${$project().name}';
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
				$.set(flutterSdkVersion, latestVersion.trim(), true);
			}
		} catch(error) {
			console.error('Unable to fetch latest Flutter SDK version', error);
		}
	}

	async function createFlutterPlatform() {
		try {
			$.set(isCreatingPlatform, true);

			const projectSdk = sdk.forProject(page.params.region, page.params.project).project;
			const platformId = ID.unique();

			switch (platform()) {
				case 'flutter-android':
					await projectSdk.createAndroidPlatform({
						platformId,
						name: $createPlatform().name,
						applicationId: $createPlatform().key
					});
					break;

				case 'flutter-ios':

				case 'flutter-macos':
					await projectSdk.createApplePlatform({
						platformId,
						name: $createPlatform().name,
						bundleIdentifier: $createPlatform().key
					});
					break;

				case 'flutter-linux':
					await projectSdk.createLinuxPlatform({
						platformId,
						name: $createPlatform().name,
						packageName: $createPlatform().key
					});
					break;

				case 'flutter-windows':
					await projectSdk.createWindowsPlatform({
						platformId,
						name: $createPlatform().name,
						packageIdentifierName: $createPlatform().key
					});
					break;

				case 'flutter-web':
					await projectSdk.createWebPlatform({
						platformId,
						name: $createPlatform().name,
						hostname: $createPlatform().hostname || undefined
					});
					break;

				default:
					throw new Error(`Unknown platform type: ${platform()}`);
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
		fetchFlutterSdkVersion();

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
		let $1 = $.derived(() => getCorrectTitle(isConnectPlatform(), 'Flutter'));

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
								onSubmit: createFlutterPlatform,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 'xxl',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Layout.Grid, ($$anchor, Layout_Grid) => {
													Layout_Grid($$anchor, {
														gap: 'l',
														rowGap: 'l',
														columns: 3,
														columnsXS: 2,
														columnsXXS: 1,
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
													var consequent_1 = ($$anchor) => {
														Fieldset($$anchor, {
															legend: 'Details',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_7 = $.first_child(fragment_8);

																$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																	Layout_Stack_2($$anchor, {
																		gap: 'l',
																		alignItems: 'flex-end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = root();
																			var node_8 = $.first_child(fragment_9);

																			$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																				Layout_Stack_3($$anchor, {
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

																						{
																							var consequent = ($$anchor) => {
																								InputText($$anchor, {
																									id: 'hostname',
																									get label() {
																										return hostnameLabel[platform()];
																									},

																									get placeholder() {
																										return placeholder[platform()].hostname;
																									},
																									required: true,
																									get value() {
																										return $createPlatform().hostname;
																									},

																									set value($$value) {
																										$.store_mutate(createPlatform, $.untrack($createPlatform).hostname = $$value, $.untrack($createPlatform));
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
																														var fragment_14 = $.comment();
																														var node_11 = $.first_child(fragment_14);

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

																														$.append($$anchor, fragment_14);
																													}
																												}
																											});
																										}
																									}
																								});
																							};

																							var alternate = ($$anchor) => {
																								InputText($$anchor, {
																									id: 'key',
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
																														var fragment_19 = $.comment();
																														var node_12 = $.first_child(fragment_19);

																														$.component(node_12, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
																															Typography_Caption_1($$anchor, {
																																variant: '400',
																																slot: 'tooltip',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_1 = $.text();

																																	$.template_effect(() => $.set_text(text_1, placeholder[platform()].tooltip));
																																	$.append($$anchor, text_1);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_19);
																													}
																												}
																											});
																										}
																									}
																								});
																							};

																							$.if(node_10, ($$render) => {
																								if (platform() === 'flutter-web') $$render(consequent); else $$render(alternate, -1);
																							});
																						}

																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_8, 2);

																			{
																				let $0 = $.derived(() => !platform() || !$createPlatform().name || !$createPlatform().key && !$createPlatform().hostname || $.get(isCreatingPlatform));

																				Button(node_13, {
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

																						var text_2 = $.text('Create platform');

																						$.append($$anchor, text_2);
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

													var alternate_1 = ($$anchor) => {
														var fragment_21 = $.comment();
														var node_14 = $.first_child(fragment_21);

														$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
															Layout_Stack_4($$anchor, {
																gap: 'xxl',
																children: ($$anchor, $$slotProps) => {
																	Card($$anchor, {
																		padding: 's',
																		radius: 's',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_23 = $.comment();
																			var node_15 = $.first_child(fragment_23);

																			$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																				Layout_Stack_5($$anchor, {
																					direction: 'row',
																					justifyContent: 'space-between',
																					alignItems: 'center',
																					gap: 'xs',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_24 = $.comment();
																						var node_16 = $.first_child(fragment_24);

																						$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																							Layout_Stack_6($$anchor, {
																								direction: 'row',
																								alignItems: 'center',
																								gap: 's',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_25 = root();
																									var node_17 = $.first_child(fragment_25);

																									Icon(node_17, {
																										size: 'm',
																										get icon() {
																											return IconFlutter;
																										}
																									});

																									var node_18 = $.sibling(node_17, 2);

																									$.component(node_18, () => Typography.Text, ($$anchor, Typography_Text) => {
																										Typography_Text($$anchor, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-primary',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_3 = $.text();

																												$.template_effect(() => $.set_text(text_3, `${$createPlatform().name ?? ''} (${($createPlatform().hostname || $createPlatform().key) ?? ''})`));
																												$.append($$anchor, text_3);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_25);
																								},
																								$$slots: { default: true }
																							});
																						});

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
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_21);
													};

													$.if(node_6, ($$render) => {
														if (!$.get(isPlatformCreated)) $$render(consequent_1); else $$render(alternate_1, -1);
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

							var node_19 = $.sibling(node_1, 2);

							{
								var consequent_2 = ($$anchor) => {
									Fieldset($$anchor, {
										legend: 'Clone starter',
										badge: 'Optional',
										children: ($$anchor, $$slotProps) => {
											var fragment_28 = $.comment();
											var node_20 = $.first_child(fragment_28);

											$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
												Layout_Stack_7($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_29 = root_3();
														var node_21 = $.first_child(fragment_29);

														LlmBanner(node_21, {
															platform: 'flutter',
															get configCode() {
																return configCode;
															},

															get alreadyExistsInstructions() {
																return $.get(alreadyExistsInstructions);
															},
															openers: ['cursor']
														});

														var node_22 = $.sibling(node_21, 2);

														$.component(node_22, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('1. If you\'re starting a new project, you can clone our starter kit from\n                        GitHub using the terminal, VSCode or Android Studio.');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														var div = $.sibling(node_22, 2);
														var node_23 = $.child(div);

														Code(node_23, { lang: 'bash', lineNumbers: true, code: gitCloneCode });
														$.reset(div);

														var node_24 = $.sibling(div, 2);

														$.component(node_24, () => Typography.Text, ($$anchor, Typography_Text_2) => {
															Typography_Text_2($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_30 = root_1();
																	var node_25 = $.sibling($.first_child(fragment_30));

																	InlineCode(node_25, { size: 's', code: 'lib/config/environment.dart' });
																	$.next();
																	$.append($$anchor, fragment_30);
																},
																$$slots: { default: true }
															});
														});

														var div_1 = $.sibling(node_24, 2);
														var node_26 = $.child(div_1);

														Code(node_26, {
															lang: 'dart',
															lineNumbers: true,
															get code() {
																return configCode;
															}
														});

														$.reset(div_1);

														var node_27 = $.sibling(div_1, 2);

														$.component(node_27, () => Typography.Text, ($$anchor, Typography_Text_3) => {
															Typography_Text_3($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_31 = root_2();
																	var node_28 = $.sibling($.first_child(fragment_31));

																	InlineCode(node_28, { size: 's', code: 'flutter run -d [device_name]' });

																	var node_29 = $.sibling(node_28, 2);

																	InlineCode(node_29, { size: 's', code: 'Send a ping' });
																	$.next();
																	$.append($$anchor, fragment_31);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_29);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_28);
										},
										$$slots: { default: true }
									});
								};

								$.if(node_19, ($$render) => {
									if ($.get(isPlatformCreated)) $$render(consequent_2);
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
							var fragment_33 = $.comment();
							var node_30 = $.first_child(fragment_33);

							$.component(node_30, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
								Layout_Stack_8($$anchor, {
									gap: 'xxl',
									children: ($$anchor, $$slotProps) => {
										var fragment_34 = root();
										var node_31 = $.first_child(fragment_34);

										$.component(node_31, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
											Layout_Stack_9($$anchor, {
												direction: 'row',
												justifyContent: 'center',
												gap: 'none',
												children: ($$anchor, $$slotProps) => {
													var fragment_35 = root_4();
													var node_32 = $.first_child(fragment_35);

													OnboardingPlatformCard(node_32, {
														iconSize: 2.526,
														iconColor: '#47C5FB',
														get icon() {
															return IconFlutter;
														}
													});

													var node_33 = $.sibling(node_32, 2);

													ConnectionLine(node_33, {
														get status() {
															return $.get(connectionSuccessful);
														}
													});

													var node_34 = $.sibling(node_33, 2);

													OnboardingPlatformCard(node_34, {
														iconSize: 2.526,
														iconColor: '#FD366E',
														get icon() {
															return IconAppwrite;
														}
													});

													$.append($$anchor, fragment_35);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_31, 2);

										{
											var consequent_4 = ($$anchor) => {
												var fragment_36 = $.comment();
												var node_36 = $.first_child(fragment_36);

												$.component(node_36, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
													Layout_Stack_10($$anchor, {
														direction: 'row',
														justifyContent: 'center',
														alignItems: 'center',
														gap: 'l',
														children: ($$anchor, $$slotProps) => {
															var fragment_37 = $.comment();
															var node_37 = $.first_child(fragment_37);

															{
																var consequent_3 = ($$anchor) => {
																	var fragment_38 = $.comment();
																	var node_38 = $.first_child(fragment_38);

																	$.component(node_38, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																		Typography_Text_4($$anchor, {
																			variant: 'm-400',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Waiting for connection...');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_38);
																};

																var alternate_2 = ($$anchor) => {
																	var div_2 = root_5();
																	var node_39 = $.child(div_2);

																	$.component(node_39, () => Typography.Title, ($$anchor, Typography_Title) => {
																		Typography_Title($$anchor, {
																			size: 'm',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_6 = $.text('Congratulations!');

																				$.append($$anchor, text_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_40 = $.sibling(node_39, 2);

																	$.component(node_40, () => Typography.Text, ($$anchor, Typography_Text_5) => {
																		Typography_Text_5($$anchor, {
																			variant: 'm-400',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_7 = $.text('You connected your app successfully.');

																				$.append($$anchor, text_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.reset(div_2);
																	$.transition(1, div_2, () => fade, () => ({ duration: 2500 }));
																	$.append($$anchor, div_2);
																};

																$.if(node_37, ($$render) => {
																	if (!$.get(connectionSuccessful)) $$render(consequent_3); else $$render(alternate_2, -1);
																});
															}

															$.append($$anchor, fragment_37);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_36);
											};

											$.if(node_35, ($$render) => {
												if ($.get(isPlatformCreated)) $$render(consequent_4);
											});
										}

										$.append($$anchor, fragment_34);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_33);
						},
						$$slots: { default: true }
					});
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_39 = $.comment();
					var node_41 = $.first_child(fragment_39);

					{
						var consequent_5 = ($$anchor) => {
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

									var text_8 = $.text('Skip, go to dashboard');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_41, ($$render) => {
							if ($.get(isPlatformCreated)) $$render(consequent_5);
						});
					}

					$.append($$anchor, fragment_39);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}