import * as $ from 'svelte/internal/server';
import { Wizard } from '$lib/layout';
import { base, resolve } from '$app/paths';
import { page } from '$app/state';
import { Fieldset, Card, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
import Button from '$lib/elements/forms/button.svelte';
import Aside from '../aside.svelte';
import Logs from '../../(components)/logs.svelte';
import { Copy, SvgIcon } from '$lib/components';
import { realtime } from '$lib/stores/sdk';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { getFrameworkIcon } from '$lib/stores/sites';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let deployment = data.deployment;
		let skipScreenshotTimeout = null;
		let effectiveStatus = $.derived(() => getEffectiveBuildStatus(deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));

		onMount(() => {
			const timeoutCleanup = () => {
				if (skipScreenshotTimeout) {
					clearTimeout(skipScreenshotTimeout);
					skipScreenshotTimeout = null;
				}
			};

			const realtimeUnsubscribe = realtime.forConsole(page.params.region, 'console', async (response) => {
				if (response.events.includes(`sites.${data.site.$id}.deployments.${data.deployment.$id}.update`)) {
					deployment = response.payload;

					const isReady = deployment.status === 'ready';
					const isFinished = isReady && deployment.screenshotLight && deployment.screenshotDark;

					// Fallback mechanism
					// If ready but not finished for over 30 seconds, go anyway
					if (isReady && !skipScreenshotTimeout) {
						skipScreenshotTimeout = setTimeout(
							async () => {
								goToFinishScreen();
							},
							30000
						);
					}

					if (isReady && isFinished) {
						if (skipScreenshotTimeout) {
							clearTimeout(skipScreenshotTimeout);
							skipScreenshotTimeout = null;
						}

						goToFinishScreen();
					}
				}
			});

			return () => {
				realtimeUnsubscribe();
				timeoutCleanup();
			};
		});

		async function goToFinishScreen() {
			const resolvedUrl = resolve('/(console)/project-[region]-[project]/sites/create-site/finish', { region: page.params.region, project: page.params.project });

			await goto(`${resolvedUrl}?site=${data.site.$id}`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Create site',
				href: `${base}/project-${page.params.region}-${page.params.project}/sites/site-${data.site.$id}`,
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'xl',
							children: ($$renderer) => {
								if (Card.Base) {
									$$renderer.push('<!--[-->');

									Card.Base($$renderer, {
										padding: 's',
										radius: 's',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																alignItems: 'center',
																gap: 's',
																children: ($$renderer) => {
																	SvgIcon($$renderer, {
																		iconSize: 'small',
																		size: 16,
																		name: getFrameworkIcon(data.site.framework)
																	});

																	$$renderer.push(`<!----> `);

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(data.site.name)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	Copy($$renderer, {
																		value: data.site.$id,
																		children: ($$renderer) => {
																			Tag($$renderer, {
																				variant: 'code',
																				size: 'xs',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(data.site.$id)}`);
																				},
																				$$slots: { default: true }
																			});
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
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								Fieldset($$renderer, {
									legend: 'Deploy',
									children: ($$renderer) => {
										Logs($$renderer, {
											hideScrollButtons: true,
											height: 'calc(100dvh - 430px)',
											emptyCopy: 'No logs available yet...',
											get deployment() {
												return deployment;
											},

											set deployment($$value) {
												deployment = $$value;
												$$settled = false;
											}
										});
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

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							Aside($$renderer, {
								framework: data.frameworks.frameworks.find((f) => f.key === data.site.framework),
								repositoryName: data?.repository?.name,
								branch: data.repository?.id ? data.site.providerBranch : '',
								rootDir: data.repository?.id ? data.site.providerRootDirectory : ''
							});
						}
					},

					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									alignItems: 'center',
									justifyContent: 'flex-end',
									children: ($$renderer) => {
										if (['processing', 'building', 'finalizing'].includes(effectiveStatus())) {
											$$renderer.push('<!--[0-->');

											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													variant: 'm-400',
													color: '--fgcolor-neutral-tertiary',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Deployment will continue in the background`);
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

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											size: 's',
											fullWidthMobile: true,
											secondary: true,
											href: `${base}/project-${page.params.region}-${page.params.project}/sites/site-${data.site.$id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Go to dashboard`);
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