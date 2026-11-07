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
	Card,
	Tooltip
} from '@appwrite.io/pink-svelte';

import { ID } from '@appwrite.io/console';
import { Button, Form, InputText } from '$lib/elements/forms';

import {
	IconVue,
	IconAppwrite,
	IconSvelte,
	IconReact,
	IconNuxt,
	IconTanstack,
	IconInfo,
	IconExternalLink,
	IconAngular,
	IconJs
} from '@appwrite.io/pink-icons-svelte';

import { page } from '$app/state';
import { onMount } from 'svelte';
import { realtime, sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { fade } from 'svelte/transition';
import ConnectionLine from './components/ConnectionLine.svelte';
import OnboardingPlatformCard from './components/OnboardingPlatformCard.svelte';

import {
	ReactFrameworkIcon,
	SvelteFrameworkIcon,
	NuxtFrameworkIcon,
	TanStackFrameworkIcon,
	NextjsFrameworkIcon,
	VueFrameworkIcon,
	NoFrameworkIcon,
	AngularFrameworkIcon,
	JavascriptFrameworkIcon
} from './components/index';

import { extendedHostnameRegex } from '$lib/helpers/string';
import { project } from '../../store';
import { getCorrectTitle } from './store';
import LlmBanner from './llmBanner.svelte';

var root = $.from_html(`<div class="frameworks svelte-e03ds5"></div> <!>`, 1);

var root_1 = $.from_html(`<span slot="tooltip">The hostname that your website will use to interact with the
                                        Appwrite APIs in production or development environments. No
                                        protocol or port number required.</span>`);

var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`2. Replace <!> to reflect the values below:`, 1);

var root_4 = $.from_html(
	`2. Copy the file <!>, rename it
                            to <!> and update the configuration settings.`,
	1
);

var root_5 = $.from_html(
	`4. Run the app, then click the <!> button
                        to verify the setup.`,
	1
);

var root_6 = $.from_html(`<!> <!> <div class="pink2-code-margin-fix"><!></div> <!> <div class="pink2-code-margin-fix"><!></div> <!> <div class="pink2-code-margin-fix"><!></div> <!> <div class="pink2-code-margin-fix"><!></div>`, 1);
var root_7 = $.from_html(`<!><!>`, 1);
var root_8 = $.from_html(`Open <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!>`, 1);
var root_10 = $.from_html(`<div class="u-flex u-flex-vertical u-cross-center u-gap-8"><!> <!></div>`);

export default function CreateWeb($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];

	let key = $.prop($$props, 'key', 7),
		isConnectPlatform = $.prop($$props, 'isConnectPlatform', 3, false),
		platform = $.prop($$props, 'platform', 3, 'web');

	let showExitModal = $.state(false);
	let isCreatingPlatform = $.state(false);
	let connectionSuccessful = $.state(false);
	let isChangingFramework = $.state(false);
	let isPlatformCreated = $.state($.proxy(isConnectPlatform()));
	const projectId = page.params.project;

	const updateConfigCode = (prefix = '') => `${prefix}APPWRITE_PROJECT_ID = "${projectId}"
${prefix}APPWRITE_PROJECT_NAME = "${$project().name}"
${prefix}APPWRITE_ENDPOINT = "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"
        `;

	let hostname = $.state(null);
	let hostnameError = $.state(false);

	let frameworks = [
		{
			key: 'svelte',
			label: 'Svelte',
			icon: SvelteFrameworkIcon,
			smallIcon: IconSvelte,
			portNumber: 5173,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('PUBLIC_')
		},

		{
			key: 'react',
			label: 'React',
			icon: ReactFrameworkIcon,
			smallIcon: IconReact,
			portNumber: 5173,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('VITE_')
		},

		{
			key: 'nuxt',
			label: 'Nuxt',
			icon: NuxtFrameworkIcon,
			smallIcon: IconNuxt,
			portNumber: 3000,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('NUXT_PUBLIC_')
		},

		{
			key: 'nextjs',
			label: 'Next.js',
			icon: NextjsFrameworkIcon,
			smallIcon: NextjsFrameworkIcon,
			portNumber: 3000,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('NEXT_PUBLIC_')
		},

		{
			key: 'vue',
			label: 'Vue',
			icon: VueFrameworkIcon,
			smallIcon: IconVue,
			portNumber: 5173,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('VITE_')
		},

		{
			key: 'angular',
			label: 'Angular',
			icon: AngularFrameworkIcon,
			smallIcon: IconAngular,
			portNumber: 4200,
			runCommand: 'npm run start',
			updateConfigCode: `export const environment: {
  appwriteEndpoint: string;
  appwriteProjectId: string;
  appwriteProjectName: string;
} = {
  appwriteEndpoint: '${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}',
  appwriteProjectId: '${projectId}',
  appwriteProjectName: '${$project().name}'
};`
		},

		{
			key: 'tanstack-start',
			label: 'TanStack Start',
			icon: TanStackFrameworkIcon,
			smallIcon: IconTanstack,
			portNumber: 3000,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('VITE_')
		},

		{
			key: 'js',
			label: 'JavaScript',
			icon: JavascriptFrameworkIcon,
			smallIcon: IconJs,
			portNumber: 5173,
			runCommand: 'npm run dev',
			updateConfigCode: updateConfigCode('VITE_')
		}
	];

	const selectedFramework = $.derived(() => frameworks.find((framework) => framework.key === key()));
	const selectedFrameworkIcon = $.derived(() => $.get(selectedFramework) ? $.get(selectedFramework).icon : NoFrameworkIcon);

	const llmConfig = $.derived(() => ({
		alreadyExistsInstructions: `
Install the Appwrite web SDK using the following command. Respect the user's package manager of choice. Do not use NPM if the user uses Bun for example.

\`\`\`bash
npm install appwrite
\`\`\`
        
Create a new \`appwrite.js\` (or equivalent, respecting the framework and language, don't create a JS file if TS is being used in the project) file in a suitable lib directory and have the following code:

\`\`\`js
import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
    .setProject("${projectId}");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
\`\`\`

When the app is opened, make it so that the following function is automatically called which will ping the Appwrite backend server to verify the setup. Let the user know about this function being added

\`\`\`js
client.ping();
\`\`\`
`,
		title: `Copy prompt: starter kit for Appwrite in ${$.get(selectedFramework)?.label || 'Web'}`,
		cloneCommand: `git clone https://github.com/appwrite/starter-for-${$.get(selectedFramework)?.key}\ncd starter-for-${$.get(selectedFramework)?.key}`,
		configFile: $.get(selectedFramework)?.key === 'angular' ? 'src/environments/environment.ts' : 'appwrite.js',
		configCode: // selectedFramework?.key === 'angular'
		//     ? `APPWRITE_PROJECT_ID=${projectId}\nAPPWRITE_PROJECT_NAME=${$project.name}\nAPPWRITE_ENDPOINT=${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}`
		//     : `
		//     const client = new Client()
		//         .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
		//         .setProject("${projectId}");
		//     `,
		`APPWRITE_PROJECT_ID = "${projectId}"
APPWRITE_PROJECT_NAME = "${$project().name}"
APPWRITE_ENDPOINT = "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"`,
		configLanguage: $.get(selectedFramework)?.key === 'angular' ? 'ts' : 'dotenv',
		runInstructions: `Install project dependencies using \`npm install\`, then run the app using \`${$.get(selectedFramework)?.runCommand}\`. Demo app runs on http://localhost:${$.get(selectedFramework)?.portNumber}. Click the \`Send a ping\` button to verify the setup.`,
		using: 'the terminal or VSCode'
	}));

	async function createWebPlatform() {
		const hostnameRegex = new RegExp(extendedHostnameRegex);
		const finalHostname = $.get(hostname)?.trim() || 'localhost';

		$.set(hostnameError, !hostnameRegex.test(finalHostname));

		if ($.get(hostnameError)) {
			return;
		}

		try {
			$.set(isCreatingPlatform, true);

			await sdk.forProject(page.params.region, page.params.project).project.createWebPlatform({
				platformId: ID.unique(),
				name: `${$.get(selectedFramework).label} app`,
				hostname: finalHostname
			});

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
		let $1 = $.derived(() => getCorrectTitle(isConnectPlatform(), 'Web'));

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
							var fragment_2 = root_2();
							var node_1 = $.first_child(fragment_2);

							{
								var consequent_2 = ($$anchor) => {
									Form($$anchor, {
										onSubmit: createWebPlatform,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_2();
														var node_3 = $.first_child(fragment_5);

														Fieldset(node_3, {
															legend: 'Type',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_4 = $.first_child(fragment_6);

																$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																	Layout_Stack_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var div = $.first_child(fragment_7);

																			$.each(div, 21, () => frameworks, $.index, ($$anchor, framework) => {
																				var fragment_8 = $.comment();
																				var node_5 = $.first_child(fragment_8);

																				$.component(node_5, () => Card.Selector, ($$anchor, Card_Selector) => {
																					Card_Selector($$anchor, {
																						name: 'framework',
																						get id() {
																							return $.get(framework).key;
																						},

																						get value() {
																							return $.get(framework).key;
																						},

																						get title() {
																							return $.get(framework).label;
																						},

																						get icon() {
																							return $.get(framework).icon;
																						},
																						imageRadius: 's',
																						get group() {
																							return key();
																						},

																						set group($$value) {
																							key($$value);
																						}
																					});
																				});

																				$.append($$anchor, fragment_8);
																			});

																			$.reset(div);

																			var node_6 = $.sibling(div, 2);

																			$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																				Layout_Stack_3($$anchor, {
																					direction: 'row',
																					justifyContent: 'flex-end',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_7 = $.first_child(fragment_9);

																						{
																							var consequent = ($$anchor) => {
																								{
																									let $0 = $.derived(() => !$.get(selectedFramework));

																									Button($$anchor, {
																										get disabled() {
																											return $.get($0);
																										},
																										$$events: { click: () => $.set(isChangingFramework, false) },
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text = $.text('Save');

																											$.append($$anchor, text);
																										},
																										$$slots: { default: true }
																									});
																								}
																							};

																							$.if(node_7, ($$render) => {
																								if ($.get(isChangingFramework)) $$render(consequent);
																							});
																						}

																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});

														var node_8 = $.sibling(node_3, 2);

														{
															var consequent_1 = ($$anchor) => {
																var fragment_11 = root_2();
																var node_9 = $.first_child(fragment_11);

																Fieldset(node_9, {
																	legend: 'Details',
																	children: ($$anchor, $$slotProps) => {
																		{
																			let $0 = $.derived(() => $.get(hostnameError) && 'Please enter a valid hostname');

																			InputText($$anchor, {
																				id: 'hostname',
																				label: 'Hostname',
																				placeholder: 'localhost',
																				autofocus: true,
																				get error() {
																					return $.get($0);
																				},

																				get value() {
																					return $.get(hostname);
																				},

																				set value($$value) {
																					$.set(hostname, $$value, true);
																				},

																				$$slots: {
																					info: ($$anchor, $$slotProps) => {
																						Tooltip($$anchor, {
																							slot: 'info',
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
																									var span = root_1();

																									$.append($$anchor, span);
																								}
																							}
																						});
																					}
																				}
																			});
																		}
																	},
																	$$slots: { default: true }
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																	Layout_Stack_4($$anchor, {
																		direction: 'row',
																		justifyContent: 'flex-end',
																		children: ($$anchor, $$slotProps) => {
																			{
																				let $0 = $.derived(() => !$.get(selectedFramework));

																				Button($$anchor, {
																					submit: true,
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
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															};

															$.if(node_8, ($$render) => {
																if (!$.get(isChangingFramework)) $$render(consequent_1);
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								};

								var alternate = ($$anchor) => {
									var fragment_16 = $.comment();
									var node_11 = $.first_child(fragment_16);

									$.component(node_11, () => Card.Base, ($$anchor, Card_Base) => {
										Card_Base($$anchor, {
											padding: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_17 = $.comment();
												var node_12 = $.first_child(fragment_17);

												$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
													Layout_Stack_5($$anchor, {
														direction: 'row',
														justifyContent: 'space-between',
														alignItems: 'center',
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root_2();
															var node_13 = $.first_child(fragment_18);

															$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																Layout_Stack_6($$anchor, {
																	gap: 'xxs',
																	direction: 'row',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = root_2();
																		var node_14 = $.first_child(fragment_19);

																		Icon(node_14, {
																			get icon() {
																				return $.get(selectedFramework).smallIcon;
																			}
																		});

																		var node_15 = $.sibling(node_14, 2);

																		$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text) => {
																			Typography_Text($$anchor, {
																				variant: 'm-500',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text();

																					$.template_effect(() => $.set_text(text_2, $.get(selectedFramework).label));
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

															var node_16 = $.sibling(node_13, 2);

															Button(node_16, {
																size: 's',
																secondary: true,
																get disabled() {
																	return isConnectPlatform();
																},

																$$events: {
																	click: () => {
																		$.set(isChangingFramework, true);
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Change');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
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
									});

									$.append($$anchor, fragment_16);
								};

								$.if(node_1, ($$render) => {
									if (!$.get(isPlatformCreated) || $.get(isChangingFramework)) $$render(consequent_2); else $$render(alternate, -1);
								});
							}

							var node_17 = $.sibling(node_1, 2);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_21 = root_2();
									var node_18 = $.first_child(fragment_21);

									Fieldset(node_18, {
										legend: 'Clone starter',
										badge: 'Optional',
										children: ($$anchor, $$slotProps) => {
											var fragment_22 = $.comment();
											var node_19 = $.first_child(fragment_22);

											$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
												Layout_Stack_7($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_23 = root_6();
														var node_20 = $.first_child(fragment_23);

														LlmBanner(node_20, {
															get config() {
																return $.get(llmConfig);
															},
															openers: ['cursor', 'lovable']
														});

														var node_21 = $.sibling(node_20, 2);

														$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('1. If you\'re starting a new project, you can clone our starter kit from\n                        GitHub using the terminal or VSCode.');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														var div_1 = $.sibling(node_21, 2);
														var node_22 = $.child(div_1);

														{
															let $0 = $.derived(() => `\ngit clone https://github.com/appwrite/starter-for-${$.get(selectedFramework).key}\ncd starter-for-${$.get(selectedFramework).key}`);

															Code(node_22, {
																lang: 'bash',
																lineNumbers: true,
																get code() {
																	return $.get($0);
																}
															});
														}

														$.reset(div_1);

														var node_23 = $.sibling(div_1, 2);

														{
															var consequent_3 = ($$anchor) => {
																var fragment_24 = $.comment();
																var node_24 = $.first_child(fragment_24);

																$.component(node_24, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																	Typography_Text_2($$anchor, {
																		variant: 'm-500',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_25 = root_3();
																			var node_25 = $.sibling($.first_child(fragment_25));

																			InlineCode(node_25, { size: 's', code: 'src/environments/environment.ts' });
																			$.next();
																			$.append($$anchor, fragment_25);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_24);
															};

															var alternate_1 = ($$anchor) => {
																var fragment_26 = $.comment();
																var node_26 = $.first_child(fragment_26);

																$.component(node_26, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																	Typography_Text_3($$anchor, {
																		variant: 'm-500',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_27 = root_4();
																			var node_27 = $.sibling($.first_child(fragment_27));

																			InlineCode(node_27, { size: 's', code: '.env.example' });

																			var node_28 = $.sibling(node_27, 2);

																			InlineCode(node_28, { size: 's', code: '.env' });
																			$.next();
																			$.append($$anchor, fragment_27);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_26);
															};

															$.if(node_23, ($$render) => {
																if ($.get(selectedFramework).key === 'angular') $$render(consequent_3); else $$render(alternate_1, -1);
															});
														}

														var div_2 = $.sibling(node_23, 2);
														var node_29 = $.child(div_2);

														{
															let $0 = $.derived(() => $.get(selectedFramework).key === 'angular' ? 'ts' : 'dotenv');

															Code(node_29, {
																get lang() {
																	return $.get($0);
																},
																lineNumbers: true,
																get code() {
																	return $.get(selectedFramework).updateConfigCode;
																}
															});
														}

														$.reset(div_2);

														var node_30 = $.sibling(div_2, 2);

														$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text_4) => {
															Typography_Text_4($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text('3. Install project dependencies');

																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});
														});

														var div_3 = $.sibling(node_30, 2);
														var node_31 = $.child(div_3);

														Code(node_31, { lang: 'bash', lineNumbers: true, code: 'npm install' });
														$.reset(div_3);

														var node_32 = $.sibling(div_3, 2);

														$.component(node_32, () => Typography.Text, ($$anchor, Typography_Text_5) => {
															Typography_Text_5($$anchor, {
																variant: 'm-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_28 = root_5();
																	var node_33 = $.sibling($.first_child(fragment_28));

																	InlineCode(node_33, { size: 's', code: 'Send a ping' });
																	$.next();
																	$.append($$anchor, fragment_28);
																},
																$$slots: { default: true }
															});
														});

														var div_4 = $.sibling(node_32, 2);
														var node_34 = $.child(div_4);

														Code(node_34, {
															lang: 'bash',
															lineNumbers: true,
															get code() {
																return $.get(selectedFramework).runCommand;
															}
														});

														$.reset(div_4);
														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_22);
										},
										$$slots: { default: true }
									});

									var node_35 = $.sibling(node_18, 2);

									$.component(node_35, () => Card.Base, ($$anchor, Card_Base_1) => {
										Card_Base_1($$anchor, {
											padding: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_29 = $.comment();
												var node_36 = $.first_child(fragment_29);

												$.component(node_36, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
													Layout_Stack_8($$anchor, {
														direction: 'row',
														justifyContent: 'space-between',
														children: ($$anchor, $$slotProps) => {
															var fragment_30 = root_2();
															var node_37 = $.first_child(fragment_30);

															$.component(node_37, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																Layout_Stack_9($$anchor, {
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_31 = root_7();
																		var node_38 = $.first_child(fragment_31);

																		Icon(node_38, {
																			get icon() {
																				return IconInfo;
																			},
																			color: '--fgcolor-neutral-tertiary'
																		});

																		var node_39 = $.sibling(node_38);

																		$.component(node_39, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																			Typography_Text_6($$anchor, {
																				variant: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text();

																					$.template_effect(() => $.set_text(text_6, `Demo app runs on http://localhost:${$.get(selectedFramework).portNumber ?? ''}`));
																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_31);
																	},
																	$$slots: { default: true }
																});
															});

															var node_40 = $.sibling(node_37, 2);

															{
																let $0 = $.derived(() => `http://localhost:${$.get(selectedFramework).portNumber}`);

																Button(node_40, {
																	external: true,
																	secondary: true,
																	get href() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_33 = $.comment();
																		var node_41 = $.first_child(fragment_33);

																		$.component(node_41, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
																			Layout_Stack_10($$anchor, {
																				direction: 'row',
																				gap: 'xs',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_34 = root_8();
																					var node_42 = $.sibling($.first_child(fragment_34));

																					Icon(node_42, {
																						get icon() {
																							return IconExternalLink;
																						},
																						color: '--fgcolor-neutral-tertiary'
																					});

																					$.append($$anchor, fragment_34);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_33);
																	},
																	$$slots: { default: true }
																});
															}

															$.append($$anchor, fragment_30);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_29);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_21);
								};

								$.if(node_17, ($$render) => {
									if ($.get(isPlatformCreated) && !$.get(isChangingFramework)) $$render(consequent_4);
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
					var fragment_35 = $.comment();
					var node_43 = $.first_child(fragment_35);

					$.component(node_43, () => Card.Base, ($$anchor, Card_Base_2) => {
						Card_Base_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_36 = $.comment();
								var node_44 = $.first_child(fragment_36);

								$.component(node_44, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
									Layout_Stack_11($$anchor, {
										gap: 'xxl',
										children: ($$anchor, $$slotProps) => {
											var fragment_37 = root_2();
											var node_45 = $.first_child(fragment_37);

											$.component(node_45, () => Layout.Stack, ($$anchor, Layout_Stack_12) => {
												Layout_Stack_12($$anchor, {
													direction: 'row',
													justifyContent: 'center',
													gap: 'none',
													children: ($$anchor, $$slotProps) => {
														var fragment_38 = root_9();
														var node_46 = $.first_child(fragment_38);

														OnboardingPlatformCard(node_46, {
															iconSize: 2.526,
															get icon() {
																return $.get(selectedFrameworkIcon);
															}
														});

														var node_47 = $.sibling(node_46, 2);

														ConnectionLine(node_47, {
															get status() {
																return $.get(connectionSuccessful);
															}
														});

														var node_48 = $.sibling(node_47, 2);

														OnboardingPlatformCard(node_48, {
															iconSize: 2.526,
															iconColor: '#FD366E',
															get icon() {
																return IconAppwrite;
															}
														});

														$.append($$anchor, fragment_38);
													},
													$$slots: { default: true }
												});
											});

											var node_49 = $.sibling(node_45, 2);

											{
												var consequent_6 = ($$anchor) => {
													var fragment_39 = $.comment();
													var node_50 = $.first_child(fragment_39);

													$.component(node_50, () => Layout.Stack, ($$anchor, Layout_Stack_13) => {
														Layout_Stack_13($$anchor, {
															direction: 'row',
															justifyContent: 'center',
															alignItems: 'center',
															gap: 'l',
															children: ($$anchor, $$slotProps) => {
																var fragment_40 = $.comment();
																var node_51 = $.first_child(fragment_40);

																{
																	var consequent_5 = ($$anchor) => {
																		var fragment_41 = $.comment();
																		var node_52 = $.first_child(fragment_41);

																		$.component(node_52, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																			Typography_Text_7($$anchor, {
																				variant: 'm-400',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('Waiting for connection...');

																					$.append($$anchor, text_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_41);
																	};

																	var alternate_2 = ($$anchor) => {
																		var div_5 = root_10();
																		var node_53 = $.child(div_5);

																		$.component(node_53, () => Typography.Title, ($$anchor, Typography_Title) => {
																			Typography_Title($$anchor, {
																				size: 'm',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_8 = $.text('Congratulations!');

																					$.append($$anchor, text_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_54 = $.sibling(node_53, 2);

																		$.component(node_54, () => Typography.Text, ($$anchor, Typography_Text_8) => {
																			Typography_Text_8($$anchor, {
																				variant: 'm-400',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text('You connected your app successfully.');

																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.reset(div_5);
																		$.transition(1, div_5, () => fade, () => ({ duration: 2500 }));
																		$.append($$anchor, div_5);
																	};

																	$.if(node_51, ($$render) => {
																		if (!$.get(connectionSuccessful)) $$render(consequent_5); else $$render(alternate_2, -1);
																	});
																}

																$.append($$anchor, fragment_40);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_39);
												};

												$.if(node_49, ($$render) => {
													if ($.get(isPlatformCreated)) $$render(consequent_6);
												});
											}

											$.append($$anchor, fragment_37);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_36);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_35);
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_42 = $.comment();
					var node_55 = $.first_child(fragment_42);

					{
						var consequent_7 = ($$anchor) => {
							Button($$anchor, {
								size: 's',
								secondary: true,
								fullWidthMobile: true,
								href: location.pathname,
								get disabled() {
									return $.get(isCreatingPlatform);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Skip, go to dashboard');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_55, ($$render) => {
							if ($.get(isPlatformCreated)) $$render(consequent_7);
						});
					}

					$.append($$anchor, fragment_42);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}