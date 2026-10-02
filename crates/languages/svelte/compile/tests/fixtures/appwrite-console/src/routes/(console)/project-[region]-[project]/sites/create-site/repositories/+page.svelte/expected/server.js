import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Click, trackEvent } from '$lib/actions/analytics.js';
import Card from '$lib/components/card.svelte';
import { Repositories } from '$lib/components/git/index.js';
import Button from '$lib/elements/forms/button.svelte';
import { Wizard } from '$lib/layout';
import { resolveRoute } from '$lib/stores/navigation.js';
import { installation, repository } from '$lib/stores/vcs.js';
import { Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let selectedRepository = null;

		function onConnect(e) {
			trackEvent(Click.ConnectRepositoryClick, { from: 'cover' });
			repository.set(e);

			const target = resolveRoute('/(console)/project-[region]-[project]/sites/create-site/repositories/repository-[repository]', { ...page.params, repository: e.id }) + `?installation=${$.store_get($$store_subs ??= {}, '$installation', installation).$id}`;

			goto(target);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Create site',
				href: resolveRoute('/(console)/project-[region]-[project]/sites', page.params),
				hideFooter: true,
				children: ($$renderer) => {
					if (!!data?.installations?.total) {
						$$renderer.push('<!--[0-->');

						Fieldset($$renderer, {
							legend: 'Git repository',
							children: ($$renderer) => {
								Repositories($$renderer, {
									product: 'sites',
									action: 'button',
									connect: onConnect,
									get selectedRepository() {
										return selectedRepository;
									},

									set selectedRepository($$value) {
										selectedRepository = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Repositories($$renderer, {
							product: 'sites',
							action: 'button',
							connect: onConnect,
							get selectedRepository() {
								return selectedRepository;
							},

							set selectedRepository($$value) {
								selectedRepository = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							Card($$renderer, {
								radius: 's',
								padding: 's',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'l',
											children: ($$renderer) => {
												if (!data?.installations?.total) {
													$$renderer.push('<!--[0-->');

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'xxs',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variation: 'm-400',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Don't have a repository set up yet? Explore our templates, available in
                            all your favorite frameworks, and deploy in seconds.`);
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
														href: resolveRoute('/(console)/project-[region]-[project]/sites/create-site/templates', page.params),
														secondary: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->View templates`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push('<!--[-1-->');

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variation: 'm-500',
																		color: '--fgcolor-neutral-primary',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Missing a repository?`);
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
																		variation: 'm-400',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Make sure Appwrite has access to your GitHub repositories. If you chose
                            specific repos, you may need to update your permissions to include the
                            missing one.`);
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

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															direction: 'row',
															children: ($$renderer) => {
																Button($$renderer, {
																	href: 'https://appwrite.io/docs/products/sites/deploy-from-git',
																	external: true,
																	secondary: true,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Docs`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																if ($.store_get($$store_subs ??= {}, '$installation', installation)) {
																	$$renderer.push('<!--[0-->');

																	Button($$renderer, {
																		href: `https://github.com/settings/installations/${$.store_get($$store_subs ??= {}, '$installation', installation).providerInstallationId}`,
																		external: true,
																		text: true,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Go to GitHub`);
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