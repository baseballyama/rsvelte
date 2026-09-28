import * as $ from 'svelte/internal/server';
import { EmptySearch, PaginationInline } from '$lib/components';
import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
import { timeFromNow } from '$lib/helpers/date';
import { sdk } from '$lib/stores/sdk';
import { repositories } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';
import { installation, installations, repository } from '$lib/stores/vcs';
import { isSmallViewport } from '$lib/stores/viewport';

import {
	Layout,
	Table,
	Typography,
	Icon,
	Avatar,
	Button as PinkButton
} from '@appwrite.io/pink-svelte';

import { IconLockClosed, IconPlus } from '@appwrite.io/pink-icons-svelte';
import ConnectGit from './connectGit.svelte';
import SvgIcon from '../svgIcon.svelte';
import { Query, VCSDetectionType } from '@appwrite.io/console';
import { getFrameworkIcon } from '$lib/stores/sites';
import { connectGitHub } from '$lib/stores/git';
import { addNotification } from '$lib/stores/notifications';
import { page } from '$app/state';
import Card from '../card.svelte';
import SkeletonRepoList from './skeletonRepoList.svelte';
import { onMount, untrack, onDestroy } from 'svelte';
import { debounce } from '$lib/helpers/debounce';

export default function Repositories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			action = 'select',
			selectedRepository = undefined,
			installationList = $.store_get($$store_subs ??= {}, '$installations', installations),
			hasInstallations = $.store_get($$store_subs ??= {}, '$installations', installations)?.total > 0,
			product = 'functions',
			callbackState = null,
			connect = () => {}
		} = $$props;

		let search = '';
		let selectedInstallation = null;
		let isLoadingRepositories = null;
		let installationsMap = null;
		let offset = 0;
		let connectingRepositoryId = null;
		let loadRepositoriesRequestId = 0;
		const limit = 5;

		onMount(() => {
			isLoadingRepositories = true;
			loadInstallations();
		});

		const debouncedLoadRepositories = debounce(
			async (installationId, searchTerm) => {
				isLoadingRepositories = true;

				try {
					await loadRepositories(installationId, searchTerm);
				} finally {
					isLoadingRepositories = false;
				}
			},
			300
		);

		const loadRepositoryPage = async () => {
			isLoadingRepositories = true;

			try {
				await loadRepositories(selectedInstallation, search);
			} finally {
				isLoadingRepositories = false;
			}
		};

		// reset offset to 0 when search changes
		onDestroy(() => {
			debouncedLoadRepositories.cancel();
		});

		async function loadInstallations() {
			if (installationList) {
				if (installationList.installations.length) {
					if (!selectedInstallation) {
						untrack(() => selectedInstallation = installationList.installations[0].$id);
					}

					installation.set(installationList.installations.find((entry) => entry.$id === selectedInstallation));
				}

				installationsMap = installationList.installations;
			} else {
				const { installations } = await sdk.forProject(page.params.region, page.params.project).vcs.listInstallations();

				if (installations.length) {
					if (!selectedInstallation) {
						untrack(() => selectedInstallation = installations[0].$id);
					}

					installation.set(installations.find((entry) => entry.$id === selectedInstallation));
				}

				installationsMap = installations;
			}
		}

		async function loadRepositories(installationId, search) {
			const requestId = ++loadRepositoriesRequestId;

			const result = await sdk.forProject(page.params.region, page.params.project).vcs.listRepositories({
				installationId,
				type: product === 'functions' ? VCSDetectionType.Runtime : VCSDetectionType.Framework,
				search: search || undefined,
				queries: [Query.limit(limit), Query.offset(offset)]
			});

			// Stale request
			if (requestId !== loadRepositoriesRequestId) {
				return;
			}

			$.store_mutate($$store_subs ??= {}, '$repositories', repositories, $.store_get($$store_subs ??= {}, '$repositories', repositories).repositories = product === 'functions'
				? result.runtimeProviderRepositories
				: result.frameworkProviderRepositories); //TODO: remove forced cast after backend fixes

			$.store_mutate($$store_subs ??= {}, '$repositories', repositories, $.store_get($$store_subs ??= {}, '$repositories', repositories).total = result.total);
			$.store_mutate($$store_subs ??= {}, '$repositories', repositories, $.store_get($$store_subs ??= {}, '$repositories', repositories).search = search);
			$.store_mutate($$store_subs ??= {}, '$repositories', repositories, $.store_get($$store_subs ??= {}, '$repositories', repositories).installationId = installationId);

			return $.store_get($$store_subs ??= {}, '$repositories', repositories).repositories;
		}

		selectedRepository;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (hasInstallations) {
				$$renderer.push('<!--[0-->');

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 's',
									children: ($$renderer) => {
										if (!installationsMap) {
											$$renderer.push('<!--[0-->');

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													children: ($$renderer) => {
														InputSelect($$renderer, {
															disabled: true,
															id: 'installation',
															options: [{ label: 'Loading...', value: null }],
															value: null
														});

														$$renderer.push(`<!----> `);
														InputSearch($$renderer, { placeholder: 'Search repositories', disabled: true });
														$$renderer.push(`<!---->`);
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

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
													children: ($$renderer) => {
														InputSelect($$renderer, {
															id: 'installation',
															options: [
																...installationsMap.map((entry) => {
																	return { label: entry.organization, value: entry.$id };
																}),

																{
																	label: 'Add installation',
																	leadingIcon: IconPlus,
																	value: 'new'
																}
															],

															get value() {
																return selectedInstallation;
															},

															set value($$value) {
																selectedInstallation = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> `);

														InputSearch($$renderer, {
															placeholder: 'Search repositories',
															get value() {
																return search;
															},

															set value($$value) {
																search = $$value;
																$$settled = false;
															}
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

							if (selectedInstallation) {
								$$renderer.push('<!--[0-->');

								if (isLoadingRepositories) {
									$$renderer.push('<!--[0-->');
									SkeletonRepoList($$renderer, { count: limit });
								} else if ($.store_get($$store_subs ??= {}, '$repositories', repositories).total > 0) {
									$$renderer.push('<!--[1-->');

									if (Table.Root) {
										$$renderer.push('<!--[-->');

										Table.Root($$renderer, {
											columns: 1,
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$renderer, { root }) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$repositories', repositories).repositories);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let repo = each_array[$$index];

														if (Table.Row.Base) {
															$$renderer.push('<!--[-->');

															Table.Row.Base($$renderer, {
																root,
																children: ($$renderer) => {
																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			root,
																			children: ($$renderer) => {
																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						direction: 'row',
																						alignItems: 'center',
																						gap: 's',
																						children: ($$renderer) => {
																							if (action === 'select') {
																								$$renderer.push(`<!--[0--><input class="is-small u-margin-inline-end-8" type="radio" name="repositories"${$.attr('checked', selectedRepository === repo.id, true)}${$.attr('value', repo.id)}/>`);
																							} else {
																								$$renderer.push('<!--[-1-->');
																							}

																							$$renderer.push(`<!--]--> `);

																							if (product === 'sites') {
																								$$renderer.push('<!--[0-->');

																								if ('framework' in repo && repo?.framework && repo.framework !== 'other') {
																									$$renderer.push('<!--[0-->');

																									Avatar($$renderer, {
																										size: 'xs',
																										alt: repo.name,
																										children: ($$renderer) => {
																											SvgIcon($$renderer, { name: getFrameworkIcon(repo.framework), iconSize: 'small' });
																										},
																										$$slots: { default: true }
																									});
																								} else {
																									$$renderer.push('<!--[-1-->');
																									Avatar($$renderer, { size: 'xs', alt: repo.name, empty: true });
																								}

																								$$renderer.push(`<!--]-->`);
																							} else {
																								$$renderer.push('<!--[-1-->');

																								const iconName = 'runtime' in repo && repo?.runtime ? repo.runtime.split('-')[0] : undefined;

																								Avatar($$renderer, {
																									size: 'xs',
																									alt: repo.name,
																									empty: !iconName,
																									children: ($$renderer) => {
																										if (iconName) {
																											$$renderer.push('<!--[0-->');
																											SvgIcon($$renderer, { name: iconName, iconSize: 'small' });
																										} else {
																											$$renderer.push('<!--[-1-->');
																										}

																										$$renderer.push(`<!--]-->`);
																									},
																									$$slots: { default: true }
																								});
																							}

																							$$renderer.push(`<!--]--> `);

																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									direction: 'row',
																									alignItems: 'center',
																									gap: 's',
																									style: 'flex: 1; min-width: 0;',
																									children: ($$renderer) => {
																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												truncate: true,
																												color: '--fgcolor-neutral-secondary',
																												style: 'flex: 1; min-width: 0;',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(repo.name)}`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (repo.private) {
																											$$renderer.push('<!--[0-->');

																											Icon($$renderer, {
																												size: 's',
																												icon: IconLockClosed,
																												color: '--fgcolor-neutral-tertiary'
																											});
																										} else {
																											$$renderer.push('<!--[-1-->');
																										}

																										$$renderer.push(`<!--]--> `);

																										if (!$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
																											$$renderer.push(`<!--[0--><time${$.attr('datetime', repo.pushedAt)}>`);

																											if (Typography.Caption) {
																												$$renderer.push('<!--[-->');

																												Typography.Caption($$renderer, {
																													variant: '400',
																													truncate: true,
																													color: '--fgcolor-neutral-tertiary',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->${$.escape(timeFromNow(repo.pushedAt))}`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(`</time>`);
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

																							$$renderer.push(` `);

																							if (action === 'button') {
																								$$renderer.push('<!--[0-->');

																								if (PinkButton.Button) {
																									$$renderer.push('<!--[-->');

																									PinkButton.Button($$renderer, {
																										size: 'xs',
																										variant: 'secondary',
																										style: 'flex-shrink: 0;',
																										disabled: !!connectingRepositoryId,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Connect`);
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
												}
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else if (search) {
									$$renderer.push('<!--[2-->');

									EmptySearch($$renderer, {
										hidePages: true,
										hidePagination: true,
										target: 'repositories',
										get search() {
											return search;
										},

										set search($$value) {
											search = $$value;
											$$settled = false;
										},

										$$slots: {
											actions: ($$renderer) => {
												{
													if (search) {
														$$renderer.push('<!--[0-->');

														Button($$renderer, {
															secondary: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Clear search`);
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
								} else {
									$$renderer.push('<!--[-1-->');

									Card($$renderer, {
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													alignItems: 'center',
													justifyContent: 'center',
													children: ($$renderer) => {
														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variation: 'm-500',
																color: '--fgcolor-neutral-tertiary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->No repositories available`);
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
								}

								$$renderer.push(`<!--]--> `);

								if (isLoadingRepositories || $.store_get($$store_subs ??= {}, '$repositories', repositories).total > 0) {
									$$renderer.push('<!--[0-->');

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											wrap: 'wrap',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														color: '--fgcolor-neutral-secondary',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Total results: ${$.escape($.store_get($$store_subs ??= {}, '$repositories', repositories).total)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												PaginationInline($$renderer, {
													limit,
													total: isLoadingRepositories
														? 0
														: $.store_get($$store_subs ??= {}, '$repositories', repositories).total,
													hidePages: true,
													get offset() {
														return offset;
													},

													set offset($$value) {
														offset = $$value;
														$$settled = false;
													}
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
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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
			} else {
				$$renderer.push('<!--[-1-->');
				ConnectGit($$renderer, { callbackState });
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, {
			action,
			selectedRepository,
			installationList,
			hasInstallations
		});
	});
}