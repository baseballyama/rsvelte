import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let deployment = $.state($.proxy($$props.data.deployment));
	let skipScreenshotTimeout = $.state(null);
	let effectiveStatus = $.derived(() => getEffectiveBuildStatus($.get(deployment), $regionalConsoleVariables()));

	onMount(() => {
		const timeoutCleanup = () => {
			if ($.get(skipScreenshotTimeout)) {
				clearTimeout($.get(skipScreenshotTimeout));
				$.set(skipScreenshotTimeout, null);
			}
		};

		const realtimeUnsubscribe = realtime.forConsole(page.params.region, 'console', async (response) => {
			if (response.events.includes(`sites.${$$props.data.site.$id}.deployments.${$$props.data.deployment.$id}.update`)) {
				$.set(deployment, response.payload, true);

				const isReady = $.get(deployment).status === 'ready';
				const isFinished = isReady && $.get(deployment).screenshotLight && $.get(deployment).screenshotDark;

				// Fallback mechanism
				// If ready but not finished for over 30 seconds, go anyway
				if (isReady && !$.get(skipScreenshotTimeout)) {
					$.set(
						skipScreenshotTimeout,
						setTimeout(
							async () => {
								goToFinishScreen();
							},
							30000
						),
						true
					);
				}

				if (isReady && isFinished) {
					if ($.get(skipScreenshotTimeout)) {
						clearTimeout($.get(skipScreenshotTimeout));
						$.set(skipScreenshotTimeout, null);
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

		await goto(`${resolvedUrl}?site=${$$props.data.site.$id}`);
	}

	{
		let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/sites/site-${$$props.data.site.$id}`);

		Wizard($$anchor, {
			title: 'Create site',
			get href() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						gap: 'xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_1 = $.first_child(fragment_2);

							$.component(node_1, () => Card.Base, ($$anchor, Card_Base) => {
								Card_Base($$anchor, {
									padding: 's',
									radius: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_2 = $.first_child(fragment_3);

										$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												direction: 'row',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_3 = $.first_child(fragment_4);

													$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															direction: 'row',
															alignItems: 'center',
															gap: 's',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_4 = $.first_child(fragment_5);

																{
																	let $0 = $.derived(() => getFrameworkIcon($$props.data.site.framework));

																	SvgIcon(node_4, {
																		iconSize: 'small',
																		size: 16,
																		get name() {
																			return $.get($0);
																		}
																	});
																}

																var node_5 = $.sibling(node_4, 2);

																$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
																	Typography_Text($$anchor, {
																		variant: 'm-500',
																		color: '--fgcolor-neutral-primary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text();

																			$.template_effect(() => $.set_text(text, $$props.data.site.name));
																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_6 = $.sibling(node_5, 2);

																Copy(node_6, {
																	get value() {
																		return $$props.data.site.$id;
																	},

																	children: ($$anchor, $$slotProps) => {
																		Tag($$anchor, {
																			variant: 'code',
																			size: 'xs',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text();

																				$.template_effect(() => $.set_text(text_1, $$props.data.site.$id));
																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	},
																	$$slots: { default: true }
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_1, 2);

							Fieldset(node_7, {
								legend: 'Deploy',
								children: ($$anchor, $$slotProps) => {
									Logs($$anchor, {
										hideScrollButtons: true,
										height: 'calc(100dvh - 430px)',
										emptyCopy: 'No logs available yet...',
										get deployment() {
											return $.get(deployment);
										},

										set deployment($$value) {
											$.set(deployment, $$value, true);
										}
									});
								},
								$$slots: { default: true }
							});

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
					{
						let $0 = $.derived(() => $$props.data.frameworks.frameworks.find((f) => f.key === $$props.data.site.framework));
						let $1 = $.derived(() => $$props.data?.repository?.name);
						let $2 = $.derived(() => $$props.data.repository?.id ? $$props.data.site.providerBranch : '');
						let $3 = $.derived(() => $$props.data.repository?.id ? $$props.data.site.providerRootDirectory : '');

						Aside($$anchor, {
							get framework() {
								return $.get($0);
							},

							get repositoryName() {
								return $.get($1);
							},

							get branch() {
								return $.get($2);
							},

							get rootDir() {
								return $.get($3);
							}
						});
					}
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_11 = $.comment();
					var node_8 = $.first_child(fragment_11);

					$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
						Layout_Stack_3($$anchor, {
							direction: 'row',
							alignItems: 'center',
							justifyContent: 'flex-end',
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_1();
								var node_9 = $.first_child(fragment_12);

								{
									var consequent = ($$anchor) => {
										var fragment_13 = $.comment();
										var node_10 = $.first_child(fragment_13);

										$.component(node_10, () => Typography.Text, ($$anchor, Typography_Text_1) => {
											Typography_Text_1($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-tertiary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Deployment will continue in the background');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									};

									var d = $.derived(() => ['processing', 'building', 'finalizing'].includes($.get(effectiveStatus)));

									$.if(node_9, ($$render) => {
										if ($.get(d)) $$render(consequent);
									});
								}

								var node_11 = $.sibling(node_9, 2);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/sites/site-${$$props.data.site.$id}`);

									Button(node_11, {
										size: 's',
										fullWidthMobile: true,
										secondary: true,
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Go to dashboard');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								}

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}