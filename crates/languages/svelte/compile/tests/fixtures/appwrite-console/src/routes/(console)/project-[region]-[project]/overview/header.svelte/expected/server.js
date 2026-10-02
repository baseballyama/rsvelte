import * as $ from 'svelte/internal/server';
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

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function dismissOnboarding() {
			setHasOnboardingDismissed(page.params.project, $.store_get($$store_subs ??= {}, '$user', user));
			trackEvent('onboarding_hub_platform_dismiss');
			goto(resolve('/(console)/project-[region]-[project]/overview/platforms', { region: page.params.region, project: page.params.project }));
		}

		if (!page.url.pathname.includes('get-started')) {
			$$renderer.push('<!--[0-->');

			Cover($$renderer, {
				$$slots: {
					header: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									alignItems: 'baseline',
									direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
									children: ($$renderer) => {
										if (Typography.Title) {
											$$renderer.push('<!--[-->');

											Typography.Title($$renderer, {
												color: '--fgcolor-neutral-primary',
												size: 'xl',
												truncate: true,
												children: ($$renderer) => {
													$$renderer.push(`<span class="project-title svelte-1ted0pr">${$.escape(page.data.project?.name)}</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												inline: true,
												children: ($$renderer) => {
													Id($$renderer, {
														value: page.params.project,
														copyText: 'Copy project ID',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(page.params.project)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													if ($.store_get($$store_subs ??= {}, '$projectRegion', projectRegion)) {
														$$renderer.push('<!--[0-->');

														RegionEndpoint($$renderer, {
															region: $.store_get($$store_subs ??= {}, '$projectRegion', projectRegion)
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
						}
					}
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');

			Cover($$renderer, {
				blocksize: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'auto' : '152px',
				$$slots: {
					header: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
									justifyContent: 'space-between',
									alignItems: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'flex-start' : 'center',
									gap: 'xl',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'column',
												gap: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 's' : 'xs',
												children: ($$renderer) => {
													if (Typography.Title) {
														$$renderer.push('<!--[-->');

														Typography.Title($$renderer, {
															color: '--fgcolor-neutral-primary',
															size: 'xl',
															children: ($$renderer) => {
																if ($.store_get($$store_subs ??= {}, '$user', user).name === $.store_get($$store_subs ??= {}, '$user', user).email) {
																	$$renderer.push(`<!--[0-->Welcome to Appwrite`);
																} else {
																	$$renderer.push(`<!--[-1-->Welcome, ${$.escape($.store_get($$store_subs ??= {}, '$user', user).name)}`);
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

													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															size: 'm',
															color: '--fgcolor-neutral-secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Follow a few quick steps to get started with Appwrite`);
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

										$$renderer.push(` <div class="dashboard-header-button">`);

										if (!hasOnboardingDismissed(page.params.project, $.store_get($$store_subs ??= {}, '$user', user))) {
											$$renderer.push('<!--[0-->');

											if (Button.Button) {
												$$renderer.push('<!--[-->');

												Button.Button($$renderer, {
													size: 's',
													variant: 'secondary',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Dismiss this page`);
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

										$$renderer.push(`<!--]--></div>`);
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

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}