import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Id, RegionEndpoint } from '$lib/components';
import { Cover } from '$lib/layout';
import { projectRegion } from '../store';
import { hasOnboardingDismissed, setHasOnboardingDismissed } from '$lib/helpers/onboarding';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { Layout, Button, Typography } from '@appwrite.io/pink-svelte';
import { user } from '$lib/stores/user';
import { isSmallViewport } from '$lib/stores/viewport';
import { trackEvent } from '$lib/actions/analytics';

var root = $.from_html(`<span class="project-title svelte-1ted0pr"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="dashboard-header-button"><!></div>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $projectRegion = () => $.store_get(projectRegion, '$projectRegion', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function dismissOnboarding() {
		setHasOnboardingDismissed(page.params.project, $user());
		trackEvent('onboarding_hub_platform_dismiss');
		goto(resolve('/(console)/project-[region]-[project]/overview/platforms', { region: page.params.region, project: page.params.project }));
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			Cover($$anchor, {
				$$slots: {
					header: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

							$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									alignItems: 'baseline',
									get direction() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_2 = $.first_child(fragment_3);

										$.component(node_2, () => Typography.Title, ($$anchor, Typography_Title) => {
											Typography_Title($$anchor, {
												color: '--fgcolor-neutral-primary',
												size: 'xl',
												truncate: true,
												children: ($$anchor, $$slotProps) => {
													var span = root();
													var text = $.only_child(span, true);

													$.template_effect(() => $.set_text(text, page.data.project?.name));
													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});

										var node_3 = $.sibling(node_2, 2);

										$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												direction: 'row',
												inline: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_4 = $.first_child(fragment_4);

													Id(node_4, {
														get value() {
															return page.params.project;
														},
														copyText: 'Copy project ID',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text();

															$.template_effect(() => $.set_text(text_1, page.params.project));
															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});

													var node_5 = $.sibling(node_4, 2);

													{
														var consequent = ($$anchor) => {
															RegionEndpoint($$anchor, {
																get region() {
																	return $projectRegion();
																}
															});
														};

														$.if(node_5, ($$render) => {
															if ($projectRegion()) $$render(consequent);
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
							});
						}

						$.append($$anchor, fragment_2);
					}
				}
			});
		};

		var d = $.derived(() => !page.url.pathname.includes('get-started'));

		var alternate_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => $isSmallViewport() ? 'auto' : '152px');

				Cover($$anchor, {
					get blocksize() {
						return $.get($0);
					},

					$$slots: {
						header: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_6 = $.first_child(fragment_8);

							{
								let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');
								let $1 = $.derived(() => $isSmallViewport() ? 'flex-start' : 'center');

								$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										get direction() {
											return $.get($0);
										},
										justifyContent: 'space-between',
										get alignItems() {
											return $.get($1);
										},
										gap: 'xl',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_2();
											var node_7 = $.first_child(fragment_9);

											{
												let $0 = $.derived(() => $isSmallViewport() ? 's' : 'xs');

												$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														direction: 'column',
														get gap() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_1();
															var node_8 = $.first_child(fragment_10);

															$.component(node_8, () => Typography.Title, ($$anchor, Typography_Title_1) => {
																Typography_Title_1($$anchor, {
																	color: '--fgcolor-neutral-primary',
																	size: 'xl',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_9 = $.first_child(fragment_11);

																		{
																			var consequent_2 = ($$anchor) => {
																				var text_2 = $.text('Welcome to Appwrite');

																				$.append($$anchor, text_2);
																			};

																			var alternate = ($$anchor) => {
																				var text_3 = $.text();

																				$.template_effect(() => $.set_text(text_3, `Welcome, ${$user().name ?? ''}`));
																				$.append($$anchor, text_3);
																			};

																			$.if(node_9, ($$render) => {
																				if ($user().name === $user().email) $$render(consequent_2); else $$render(alternate, -1);
																			});
																		}

																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_8, 2);

															$.component(node_10, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	size: 'm',
																	color: '--fgcolor-neutral-secondary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Follow a few quick steps to get started with Appwrite');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});
											}

											var div = $.sibling(node_7, 2);
											var node_11 = $.child(div);

											{
												var consequent_3 = ($$anchor) => {
													var fragment_13 = $.comment();
													var node_12 = $.first_child(fragment_13);

													$.component(node_12, () => Button.Button, ($$anchor, Button_Button) => {
														Button_Button($$anchor, {
															size: 's',
															variant: 'secondary',
															$$events: { click: dismissOnboarding },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Dismiss this page');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_13);
												};

												var d_1 = $.derived(() => !hasOnboardingDismissed(page.params.project, $user()));

												$.if(node_11, ($$render) => {
													if ($.get(d_1)) $$render(consequent_3);
												});
											}

											$.reset(div);
											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_8);
						}
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}