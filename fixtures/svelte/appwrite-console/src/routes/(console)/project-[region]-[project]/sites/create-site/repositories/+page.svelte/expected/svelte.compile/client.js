import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $installation = () => $.store_get(installation, '$installation', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let selectedRepository = $.state(null);

	function onConnect(e) {
		trackEvent(Click.ConnectRepositoryClick, { from: 'cover' });
		repository.set(e);

		const target = resolveRoute('/(console)/project-[region]-[project]/sites/create-site/repositories/repository-[repository]', { ...page.params, repository: e.id }) + `?installation=${$installation().$id}`;

		goto(target);
	}

	{
		let $0 = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/sites', page.params));

		Wizard($$anchor, {
			title: 'Create site',
			get href() {
				return $.get($0);
			},
			hideFooter: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						Fieldset($$anchor, {
							legend: 'Git repository',
							children: ($$anchor, $$slotProps) => {
								Repositories($$anchor, {
									product: 'sites',
									action: 'button',
									connect: onConnect,
									get selectedRepository() {
										return $.get(selectedRepository);
									},

									set selectedRepository($$value) {
										$.set(selectedRepository, $$value, true);
									}
								});
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						Repositories($$anchor, {
							product: 'sites',
							action: 'button',
							connect: onConnect,
							get selectedRepository() {
								return $.get(selectedRepository);
							},

							set selectedRepository($$value) {
								$.set(selectedRepository, $$value, true);
							}
						});
					};

					$.if(node, ($$render) => {
						if (!!$$props.data?.installations?.total) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				aside: ($$anchor, $$slotProps) => {
					Card($$anchor, {
						radius: 's',
						padding: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_1 = $.first_child(fragment_6);

							$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									gap: 'l',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_2 = $.first_child(fragment_7);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_8 = root();
												var node_3 = $.first_child(fragment_8);

												$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
													Layout_Stack_1($$anchor, {
														gap: 'xxs',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_4 = $.first_child(fragment_9);

															$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	variation: 'm-400',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Don\'t have a repository set up yet? Explore our templates, available in\n                            all your favorite frameworks, and deploy in seconds.');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_3, 2);

												{
													let $0 = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/sites/create-site/templates', page.params));

													Button(node_5, {
														get href() {
															return $.get($0);
														},
														secondary: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('View templates');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												}

												$.append($$anchor, fragment_8);
											};

											var alternate_1 = ($$anchor) => {
												var fragment_10 = root();
												var node_6 = $.first_child(fragment_10);

												$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
													Layout_Stack_2($$anchor, {
														gap: 's',
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root();
															var node_7 = $.first_child(fragment_11);

															$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																Typography_Text_1($$anchor, {
																	variation: 'm-500',
																	color: '--fgcolor-neutral-primary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Missing a repository?');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																Typography_Text_2($$anchor, {
																	variation: 'm-400',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Make sure Appwrite has access to your GitHub repositories. If you chose\n                            specific repos, you may need to update your permissions to include the\n                            missing one.');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_6, 2);

												$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														gap: 's',
														direction: 'row',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root();
															var node_10 = $.first_child(fragment_12);

															Button(node_10, {
																href: 'https://appwrite.io/docs/products/sites/deploy-from-git',
																external: true,
																secondary: true,
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('Docs');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});

															var node_11 = $.sibling(node_10, 2);

															{
																var consequent_2 = ($$anchor) => {
																	{
																		let $0 = $.derived(() => `https://github.com/settings/installations/${$installation().providerInstallationId}`);

																		Button($$anchor, {
																			get href() {
																				return $.get($0);
																			},
																			external: true,
																			text: true,
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Go to GitHub');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	}
																};

																$.if(node_11, ($$render) => {
																	if ($installation()) $$render(consequent_2);
																});
															}

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											};

											$.if(node_2, ($$render) => {
												if (!$$props.data?.installations?.total) $$render(consequent_1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}