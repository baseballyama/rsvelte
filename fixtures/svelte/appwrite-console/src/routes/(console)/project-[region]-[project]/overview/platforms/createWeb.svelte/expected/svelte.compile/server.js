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

export default function CreateWeb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { key, isConnectPlatform = false, platform = 'web' } = $$props;
		let showExitModal = false;
		let isCreatingPlatform = false;
		let connectionSuccessful = false;
		let isChangingFramework = false;
		let isPlatformCreated = isConnectPlatform;
		const projectId = page.params.project;

		const updateConfigCode = (prefix = '') => `${prefix}APPWRITE_PROJECT_ID = "${projectId}"
${prefix}APPWRITE_PROJECT_NAME = "${$.store_get($$store_subs ??= {}, '$project', project).name}"
${prefix}APPWRITE_ENDPOINT = "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"
        `;

		let hostname = null;
		let hostnameError = false;

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
  appwriteProjectName: '${$.store_get($$store_subs ??= {}, '$project', project).name}'
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

		const selectedFramework = $.derived(() => frameworks.find((framework) => framework.key === key));
		const selectedFrameworkIcon = $.derived(() => selectedFramework() ? selectedFramework().icon : NoFrameworkIcon);

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
			title: `Copy prompt: starter kit for Appwrite in ${selectedFramework()?.label || 'Web'}`,
			cloneCommand: `git clone https://github.com/appwrite/starter-for-${selectedFramework()?.key}\ncd starter-for-${selectedFramework()?.key}`,
			configFile: selectedFramework()?.key === 'angular' ? 'src/environments/environment.ts' : 'appwrite.js',
			configCode: // selectedFramework?.key === 'angular'
			//     ? `APPWRITE_PROJECT_ID=${projectId}\nAPPWRITE_PROJECT_NAME=${$project.name}\nAPPWRITE_ENDPOINT=${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}`
			//     : `
			//     const client = new Client()
			//         .setEndpoint("${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}")
			//         .setProject("${projectId}");
			//     `,
			`APPWRITE_PROJECT_ID = "${projectId}"
APPWRITE_PROJECT_NAME = "${$.store_get($$store_subs ??= {}, '$project', project).name}"
APPWRITE_ENDPOINT = "${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}"`,
			configLanguage: selectedFramework()?.key === 'angular' ? 'ts' : 'dotenv',
			runInstructions: `Install project dependencies using \`npm install\`, then run the app using \`${selectedFramework()?.runCommand}\`. Demo app runs on http://localhost:${selectedFramework()?.portNumber}. Click the \`Send a ping\` button to verify the setup.`,
			using: 'the terminal or VSCode'
		}));

		async function createWebPlatform() {
			const hostnameRegex = new RegExp(extendedHostnameRegex);
			const finalHostname = hostname?.trim() || 'localhost';

			hostnameError = !hostnameRegex.test(finalHostname);

			if (hostnameError) {
				return;
			}

			try {
				isCreatingPlatform = true;

				await sdk.forProject(page.params.region, page.params.project).project.createWebPlatform({
					platformId: ID.unique(),
					name: `${selectedFramework().label} app`,
					hostname: finalHostname
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
				title: getCorrectTitle(isConnectPlatform, 'Web'),
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
								if (!isPlatformCreated || isChangingFramework) {
									$$renderer.push('<!--[0-->');

									Form($$renderer, {
										onSubmit: createWebPlatform,
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													children: ($$renderer) => {
														Fieldset($$renderer, {
															legend: 'Type',
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="frameworks svelte-e03ds5"><!--[-->`);

																			const each_array = $.ensure_array_like(frameworks);

																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																				let framework = each_array[$$index];

																				if (Card.Selector) {
																					$$renderer.push('<!--[-->');

																					Card.Selector($$renderer, {
																						name: 'framework',
																						id: framework.key,
																						value: framework.key,
																						title: framework.label,
																						icon: framework.icon,
																						imageRadius: 's',
																						get group() {
																							return key;
																						},

																						set group($$value) {
																							key = $$value;
																							$$settled = false;
																						}
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}

																			$$renderer.push(`<!--]--></div> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					justifyContent: 'flex-end',
																					children: ($$renderer) => {
																						if (isChangingFramework) {
																							$$renderer.push('<!--[0-->');

																							Button($$renderer, {
																								disabled: !selectedFramework(),
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Save`);
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

														if (!isChangingFramework) {
															$$renderer.push('<!--[0-->');

															Fieldset($$renderer, {
																legend: 'Details',
																children: ($$renderer) => {
																	InputText($$renderer, {
																		id: 'hostname',
																		label: 'Hostname',
																		placeholder: 'localhost',
																		autofocus: true,
																		error: hostnameError && 'Please enter a valid hostname',
																		get value() {
																			return hostname;
																		},

																		set value($$value) {
																			hostname = $$value;
																			$$settled = false;
																		},

																		$$slots: {
																			info: ($$renderer) => {
																				Tooltip($$renderer, {
																					slot: 'info',
																					children: ($$renderer) => {
																						Icon($$renderer, { icon: IconInfo, size: 's' });
																					},

																					$$slots: {
																						default: true,
																						tooltip: ($$renderer) => {
																							$$renderer.push(`<span slot="tooltip">The hostname that your website will use to interact with the
                                        Appwrite APIs in production or development environments. No
                                        protocol or port number required.</span>`);
																						}
																					}
																				});
																			}
																		}
																	});
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> `);

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	justifyContent: 'flex-end',
																	children: ($$renderer) => {
																		Button($$renderer, {
																			submit: true,
																			disabled: !selectedFramework(),
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Create platform`);
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
								} else {
									$$renderer.push('<!--[-1-->');

									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											padding: 's',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														justifyContent: 'space-between',
														alignItems: 'center',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'xxs',
																	direction: 'row',
																	children: ($$renderer) => {
																		Icon($$renderer, { icon: selectedFramework().smallIcon });
																		$$renderer.push(`<!----> `);

																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-500',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(selectedFramework().label)}`);
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

															Button($$renderer, {
																size: 's',
																secondary: true,
																disabled: isConnectPlatform,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Change`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]--> `);

								if (isPlatformCreated && !isChangingFramework) {
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
														LlmBanner($$renderer, { config: llmConfig(), openers: ['cursor', 'lovable'] });
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

														Code($$renderer, {
															lang: 'bash',
															lineNumbers: true,
															code: `\ngit clone https://github.com/appwrite/starter-for-${selectedFramework().key}\ncd starter-for-${selectedFramework().key}`
														});

														$$renderer.push(`<!----></div> `);

														if (selectedFramework().key === 'angular') {
															$$renderer.push('<!--[0-->');

															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	variant: 'm-500',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->2. Replace `);
																		InlineCode($$renderer, { size: 's', code: 'src/environments/environment.ts' });
																		$$renderer.push(`<!----> to reflect the values below:`);
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

															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	variant: 'm-500',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->2. Copy the file `);
																		InlineCode($$renderer, { size: 's', code: '.env.example' });

																		$$renderer.push(`<!---->, rename it
                            to `);

																		InlineCode($$renderer, { size: 's', code: '.env' });
																		$$renderer.push(`<!----> and update the configuration settings.`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`<!--]--> <div class="pink2-code-margin-fix">`);

														Code($$renderer, {
															lang: selectedFramework().key === 'angular' ? 'ts' : 'dotenv',
															lineNumbers: true,
															code: selectedFramework().updateConfigCode
														});

														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->3. Install project dependencies`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);
														Code($$renderer, { lang: 'bash', lineNumbers: true, code: 'npm install' });
														$$renderer.push(`<!----></div> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->4. Run the app, then click the `);
																	InlineCode($$renderer, { size: 's', code: 'Send a ping' });

																	$$renderer.push(`<!----> button
                        to verify the setup.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <div class="pink2-code-margin-fix">`);

														Code($$renderer, {
															lang: 'bash',
															lineNumbers: true,
															code: selectedFramework().runCommand
														});

														$$renderer.push(`<!----></div>`);
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

									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											padding: 's',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														justifyContent: 'space-between',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$renderer) => {
																		Icon($$renderer, { icon: IconInfo, color: '--fgcolor-neutral-tertiary' });
																		$$renderer.push(`<!---->`);

																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Demo app runs on http://localhost:${$.escape(selectedFramework().portNumber)}`);
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

															Button($$renderer, {
																external: true,
																secondary: true,
																href: `http://localhost:${selectedFramework().portNumber}`,
																children: ($$renderer) => {
																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 'xs',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Open `);
																				Icon($$renderer, { icon: IconExternalLink, color: '--fgcolor-neutral-tertiary' });
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

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							if (Card.Base) {
								$$renderer.push('<!--[-->');

								Card.Base($$renderer, {
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
																OnboardingPlatformCard($$renderer, { iconSize: 2.526, icon: selectedFrameworkIcon() });
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

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					footer: ($$renderer) => {
						{
							if (isPlatformCreated) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									size: 's',
									secondary: true,
									fullWidthMobile: true,
									href: location.pathname,
									disabled: isCreatingPlatform,
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