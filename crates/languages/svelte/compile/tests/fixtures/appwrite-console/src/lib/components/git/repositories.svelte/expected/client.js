import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<input class="is-small u-margin-inline-end-8" type="radio" name="repositories"/>`);
var root_3 = $.from_html(`<time><!></time>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Repositories($$anchor, $$props) {
	$.push($$props, true);

	const $installations = () => $.store_get(installations, '$installations', $$stores);
	const $repositories = () => $.store_get(repositories, '$repositories', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];

	let action = $.prop($$props, 'action', 11, 'select'),
		selectedRepository = $.prop($$props, 'selectedRepository', 15, undefined),
		installationList = $.prop($$props, 'installationList', 27, () => $.proxy($installations())),
		hasInstallations = $.prop($$props, 'hasInstallations', 27, () => $installations()?.total > 0),
		product = $.prop($$props, 'product', 3, 'functions'),
		callbackState = $.prop($$props, 'callbackState', 3, null),
		connect = $.prop($$props, 'connect', 3, () => {});

	let search = $.state('');
	let selectedInstallation = $.state(null);
	let isLoadingRepositories = $.state(null);
	let installationsMap = $.state(null);
	let offset = $.state(0);
	let connectingRepositoryId = $.state(null);
	let loadRepositoriesRequestId = 0;
	const limit = 5;

	onMount(() => {
		$.set(isLoadingRepositories, true);
		loadInstallations();
	});

	const debouncedLoadRepositories = debounce(
		async (installationId, searchTerm) => {
			$.set(isLoadingRepositories, true);

			try {
				await loadRepositories(installationId, searchTerm);
			} finally {
				$.set(isLoadingRepositories, false);
			}
		},
		300
	);

	const loadRepositoryPage = async () => {
		$.set(isLoadingRepositories, true);

		try {
			await loadRepositories($.get(selectedInstallation), $.get(search));
		} finally {
			$.set(isLoadingRepositories, false);
		}
	};

	$.user_effect(() => {
		if ($.get(selectedInstallation) && $.get(search) !== undefined) {
			$.set(offset, 0 // reset offset to 0 when search changes
			);
			debouncedLoadRepositories($.get(selectedInstallation), $.get(search));
		}
	});

	onDestroy(() => {
		debouncedLoadRepositories.cancel();
	});

	async function loadInstallations() {
		if (installationList()) {
			if (installationList().installations.length) {
				if (!$.get(selectedInstallation)) {
					untrack(() => $.set(selectedInstallation, installationList().installations[0].$id, true));
				}

				installation.set(installationList().installations.find((entry) => entry.$id === $.get(selectedInstallation)));
			}

			$.set(installationsMap, installationList().installations, true);
		} else {
			const { installations } = await sdk.forProject(page.params.region, page.params.project).vcs.listInstallations();

			if (installations.length) {
				if (!$.get(selectedInstallation)) {
					untrack(() => $.set(selectedInstallation, installations[0].$id, true));
				}

				installation.set(installations.find((entry) => entry.$id === $.get(selectedInstallation)));
			}

			$.set(installationsMap, installations, true);
		}
	}

	async function loadRepositories(installationId, search) {
		const requestId = ++loadRepositoriesRequestId;

		const result = await sdk.forProject(page.params.region, page.params.project).vcs.listRepositories({
			installationId,
			type: product() === 'functions' ? VCSDetectionType.Runtime : VCSDetectionType.Framework,
			search: search || undefined,
			queries: [Query.limit(limit), Query.offset($.get(offset))]
		});

		// Stale request
		if (requestId !== loadRepositoriesRequestId) {
			return;
		}

		$.store_mutate(
			repositories,
			$.untrack($repositories).repositories = product() === 'functions'
				? result.runtimeProviderRepositories
				: result.frameworkProviderRepositories,
			$.untrack($repositories)
		); //TODO: remove forced cast after backend fixes

		$.store_mutate(repositories, $.untrack($repositories).total = result.total, $.untrack($repositories));
		$.store_mutate(repositories, $.untrack($repositories).search = search, $.untrack($repositories));
		$.store_mutate(repositories, $.untrack($repositories).installationId = installationId, $.untrack($repositories));

		return $repositories().repositories;
	}

	selectedRepository();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_14 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 's',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
												Layout_Stack_2($$anchor, {
													direction: 'row',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_1();
														var node_5 = $.first_child(fragment_5);

														InputSelect(node_5, {
															disabled: true,
															id: 'installation',
															options: [{ label: 'Loading...', value: null }],
															value: null
														});

														var node_6 = $.sibling(node_5, 2);

														InputSearch(node_6, { placeholder: 'Search repositories', disabled: true });
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										};

										var alternate = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_7 = $.first_child(fragment_6);

											{
												let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

												$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														get direction() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_8 = $.first_child(fragment_7);

															{
																let $0 = $.derived(() => [
																	...$.get(installationsMap).map((entry) => {
																		return { label: entry.organization, value: entry.$id };
																	}),

																	{
																		label: 'Add installation',
																		leadingIcon: IconPlus,
																		value: 'new'
																	}
																]);

																InputSelect(node_8, {
																	id: 'installation',
																	get options() {
																		return $.get($0);
																	},

																	get value() {
																		return $.get(selectedInstallation);
																	},

																	set value($$value) {
																		$.set(selectedInstallation, $$value, true);
																	},

																	$$events: {
																		change: () => {
																			if ($.get(selectedInstallation) === 'new') {
																				window.location.href = connectGitHub(callbackState()).toString();
																			}

																			$.set(search, '');
																			installation.set($.get(installationsMap).find((entry) => entry.$id === $.get(selectedInstallation)));
																			debouncedLoadRepositories.cancel();
																		}
																	}
																});
															}

															var node_9 = $.sibling(node_8, 2);

															InputSearch(node_9, {
																placeholder: 'Search repositories',
																get value() {
																	return $.get(search);
																},

																set value($$value) {
																	$.set(search, $$value, true);
																}
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_6);
										};

										$.if(node_3, ($$render) => {
											if (!$.get(installationsMap)) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_2, 2);

						{
							var consequent_13 = ($$anchor) => {
								var fragment_8 = root_1();
								var node_11 = $.first_child(fragment_8);

								{
									var consequent_1 = ($$anchor) => {
										SkeletonRepoList($$anchor, { count: limit });
									};

									var consequent_9 = ($$anchor) => {
										var fragment_10 = $.comment();
										var node_12 = $.first_child(fragment_10);

										$.component(node_12, () => Table.Root, ($$anchor, Table_Root) => {
											Table_Root($$anchor, {
												columns: 1,
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$anchor, $$slotProps) => {
														const root = $.derived(() => $$slotProps.root);
														var fragment_11 = $.comment();
														var node_13 = $.first_child(fragment_11);

														$.each(node_13, 1, () => $repositories().repositories, $.index, ($$anchor, repo) => {
															var fragment_12 = $.comment();
															var node_14 = $.first_child(fragment_12);

															$.component(node_14, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
																Table_Row_Base($$anchor, {
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = $.comment();
																		var node_15 = $.first_child(fragment_13);

																		$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell) => {
																			Table_Cell($$anchor, {
																				get root() {
																					return $.get(root);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = $.comment();
																					var node_16 = $.first_child(fragment_14);

																					$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																						Layout_Stack_4($$anchor, {
																							direction: 'row',
																							alignItems: 'center',
																							gap: 's',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_15 = root_5();
																								var node_17 = $.first_child(fragment_15);

																								{
																									var consequent_2 = ($$anchor) => {
																										var input = root_2();

																										$.remove_input_defaults(input);

																										var input_value;

																										$.template_effect(() => {
																											if (input_value !== (input_value = $.get(repo).id)) {
																												input.value = (input.__value = input_value) ?? '';
																											}
																										});

																										$.delegated('change', input, () => repository.set($.get(repo)));

																										$.bind_group(
																											binding_group,
																											[],
																											input,
																											() => {
																												$.get(repo).id;

																												return selectedRepository();
																											},
																											selectedRepository
																										);

																										$.append($$anchor, input);
																									};

																									$.if(node_17, ($$render) => {
																										if (action() === 'select') $$render(consequent_2);
																									});
																								}

																								var node_18 = $.sibling(node_17, 2);

																								{
																									var consequent_4 = ($$anchor) => {
																										var fragment_16 = $.comment();
																										var node_19 = $.first_child(fragment_16);

																										{
																											var consequent_3 = ($$anchor) => {
																												Avatar($$anchor, {
																													size: 'xs',
																													get alt() {
																														return $.get(repo).name;
																													},

																													children: ($$anchor, $$slotProps) => {
																														{
																															let $0 = $.derived(() => getFrameworkIcon($.get(repo).framework));

																															SvgIcon($$anchor, {
																																get name() {
																																	return $.get($0);
																																},
																																iconSize: 'small'
																															});
																														}
																													},
																													$$slots: { default: true }
																												});
																											};

																											var alternate_1 = ($$anchor) => {
																												Avatar($$anchor, {
																													size: 'xs',
																													get alt() {
																														return $.get(repo).name;
																													},
																													empty: true
																												});
																											};

																											$.if(node_19, ($$render) => {
																												if ('framework' in $.get(repo) && $.get(repo)?.framework && $.get(repo).framework !== 'other') $$render(consequent_3); else $$render(alternate_1, -1);
																											});
																										}

																										$.append($$anchor, fragment_16);
																									};

																									var alternate_2 = ($$anchor) => {
																										const iconName = $.derived(() => 'runtime' in $.get(repo) && $.get(repo)?.runtime ? $.get(repo).runtime.split('-')[0] : undefined);

																										{
																											let $0 = $.derived(() => !$.get(iconName));

																											Avatar($$anchor, {
																												size: 'xs',
																												get alt() {
																													return $.get(repo).name;
																												},

																												get empty() {
																													return $.get($0);
																												},

																												children: ($$anchor, $$slotProps) => {
																													var fragment_21 = $.comment();
																													var node_20 = $.first_child(fragment_21);

																													{
																														var consequent_5 = ($$anchor) => {
																															SvgIcon($$anchor, {
																																get name() {
																																	return $.get(iconName);
																																},
																																iconSize: 'small'
																															});
																														};

																														$.if(node_20, ($$render) => {
																															if ($.get(iconName)) $$render(consequent_5);
																														});
																													}

																													$.append($$anchor, fragment_21);
																												},
																												$$slots: { default: true }
																											});
																										}
																									};

																									$.if(node_18, ($$render) => {
																										if (product() === 'sites') $$render(consequent_4); else $$render(alternate_2, -1);
																									});
																								}

																								var node_21 = $.sibling(node_18, 2);

																								$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																									Layout_Stack_5($$anchor, {
																										direction: 'row',
																										alignItems: 'center',
																										gap: 's',
																										style: 'flex: 1; min-width: 0;',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_23 = root_4();
																											var node_22 = $.first_child(fragment_23);

																											$.component(node_22, () => Typography.Text, ($$anchor, Typography_Text) => {
																												Typography_Text($$anchor, {
																													truncate: true,
																													color: '--fgcolor-neutral-secondary',
																													style: 'flex: 1; min-width: 0;',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text = $.text();

																														$.template_effect(() => $.set_text(text, $.get(repo).name));
																														$.append($$anchor, text);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_23 = $.sibling(node_22, 2);

																											{
																												var consequent_6 = ($$anchor) => {
																													Icon($$anchor, {
																														size: 's',
																														get icon() {
																															return IconLockClosed;
																														},
																														color: '--fgcolor-neutral-tertiary'
																													});
																												};

																												$.if(node_23, ($$render) => {
																													if ($.get(repo).private) $$render(consequent_6);
																												});
																											}

																											var node_24 = $.sibling(node_23, 2);

																											{
																												var consequent_7 = ($$anchor) => {
																													var time = root_3();
																													var node_25 = $.child(time);

																													$.component(node_25, () => Typography.Caption, ($$anchor, Typography_Caption) => {
																														Typography_Caption($$anchor, {
																															variant: '400',
																															truncate: true,
																															color: '--fgcolor-neutral-tertiary',
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_1 = $.text();

																																$.template_effect(($0) => $.set_text(text_1, $0), [() => timeFromNow($.get(repo).pushedAt)]);
																																$.append($$anchor, text_1);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.reset(time);
																													$.template_effect(() => $.set_attribute(time, 'datetime', $.get(repo).pushedAt));
																													$.append($$anchor, time);
																												};

																												$.if(node_24, ($$render) => {
																													if (!$isSmallViewport()) $$render(consequent_7);
																												});
																											}

																											$.append($$anchor, fragment_23);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_26 = $.sibling(node_21, 2);

																								{
																									var consequent_8 = ($$anchor) => {
																										var fragment_27 = $.comment();
																										var node_27 = $.first_child(fragment_27);

																										{
																											let $0 = $.derived(() => !!$.get(connectingRepositoryId));

																											$.component(node_27, () => PinkButton.Button, ($$anchor, PinkButton_Button) => {
																												PinkButton_Button($$anchor, {
																													size: 'xs',
																													variant: 'secondary',
																													style: 'flex-shrink: 0;',
																													get disabled() {
																														return $.get($0);
																													},

																													$$events: {
																														click: async () => {
																															$.set(connectingRepositoryId, $.get(repo).id, true);

																															try {
																																await Promise.resolve(connect()($.get(repo)));
																															} catch(error) {
																																addNotification({
																																	type: 'error',
																																	message: error?.message ?? 'Failed to connect repository'
																																});
																															} finally {
																																$.set(connectingRepositoryId, null);
																															}
																														}
																													},

																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_2 = $.text('Connect');

																														$.append($$anchor, text_2);
																													},
																													$$slots: { default: true }
																												});
																											});
																										}

																										$.append($$anchor, fragment_27);
																									};

																									$.if(node_26, ($$render) => {
																										if (action() === 'button') $$render(consequent_8);
																									});
																								}

																								$.append($$anchor, fragment_15);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														});

														$.append($$anchor, fragment_11);
													}
												}
											});
										});

										$.append($$anchor, fragment_10);
									};

									var consequent_11 = ($$anchor) => {
										EmptySearch($$anchor, {
											hidePages: true,
											hidePagination: true,
											target: 'repositories',
											get search() {
												return $.get(search);
											},

											set search($$value) {
												$.set(search, $$value, true);
											},

											$$slots: {
												actions: ($$anchor, $$slotProps) => {
													var fragment_29 = $.comment();
													var node_28 = $.first_child(fragment_29);

													{
														var consequent_10 = ($$anchor) => {
															Button($$anchor, {
																secondary: true,
																$$events: { click: () => $.set(search, '') },
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Clear search');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														};

														$.if(node_28, ($$render) => {
															if ($.get(search)) $$render(consequent_10);
														});
													}

													$.append($$anchor, fragment_29);
												}
											}
										});
									};

									var alternate_3 = ($$anchor) => {
										Card($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_32 = $.comment();
												var node_29 = $.first_child(fragment_32);

												$.component(node_29, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
													Layout_Stack_6($$anchor, {
														alignItems: 'center',
														justifyContent: 'center',
														children: ($$anchor, $$slotProps) => {
															var fragment_33 = $.comment();
															var node_30 = $.first_child(fragment_33);

															$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																Typography_Text_1($$anchor, {
																	variation: 'm-500',
																	color: '--fgcolor-neutral-tertiary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('No repositories available');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_33);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_11, ($$render) => {
										if ($.get(isLoadingRepositories)) $$render(consequent_1); else if ($repositories().total > 0) $$render(consequent_9, 1); else if ($.get(search)) $$render(consequent_11, 2); else $$render(alternate_3, -1);
									});
								}

								var node_31 = $.sibling(node_11, 2);

								{
									var consequent_12 = ($$anchor) => {
										var fragment_34 = $.comment();
										var node_32 = $.first_child(fragment_34);

										$.component(node_32, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
											Layout_Stack_7($$anchor, {
												direction: 'row',
												justifyContent: 'space-between',
												alignItems: 'center',
												wrap: 'wrap',
												children: ($$anchor, $$slotProps) => {
													var fragment_35 = root_1();
													var node_33 = $.first_child(fragment_35);

													$.component(node_33, () => Typography.Text, ($$anchor, Typography_Text_2) => {
														Typography_Text_2($$anchor, {
															variant: 'm-400',
															color: '--fgcolor-neutral-secondary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text();

																$.template_effect(() => $.set_text(text_5, `Total results: ${$repositories().total ?? ''}`));
																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_34 = $.sibling(node_33, 2);

													{
														let $0 = $.derived(() => $.get(isLoadingRepositories) ? 0 : $repositories().total);

														PaginationInline(node_34, {
															limit,
															get total() {
																return $.get($0);
															},
															hidePages: true,
															get offset() {
																return $.get(offset);
															},

															set offset($$value) {
																$.set(offset, $$value, true);
															},
															$$events: { change: loadRepositoryPage }
														});
													}

													$.append($$anchor, fragment_35);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_34);
									};

									$.if(node_31, ($$render) => {
										if ($.get(isLoadingRepositories) || $repositories().total > 0) $$render(consequent_12);
									});
								}

								$.append($$anchor, fragment_8);
							};

							$.if(node_10, ($$render) => {
								if ($.get(selectedInstallation)) $$render(consequent_13);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_4 = ($$anchor) => {
			ConnectGit($$anchor, {
				get callbackState() {
					return callbackState();
				}
			});
		};

		$.if(node, ($$render) => {
			if (hasInstallations()) $$render(consequent_14); else $$render(alternate_4, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['change']);