import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';

import {
	CardContainer,
	Empty,
	EmptySearch,
	GridItem1,
	Id,
	PaginationWithLimit,
	SearchQuery,
	SvgIcon
} from '$lib/components';

import { toLocaleDateTime } from '$lib/helpers/date';
import { Container } from '$lib/layout';
import { isServiceLimited } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import { wizard } from '$lib/stores/wizard';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE } from '$lib/helpers/tooltipContent';
import { parseExpression } from 'cron-parser';
import { onMount } from 'svelte';
import { canWriteFunctions } from '$lib/stores/roles';
import { Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
import { IconClock, IconPlus } from '@appwrite.io/pink-icons-svelte';
import { goto } from '$app/navigation';
import { Button } from '$lib/elements/forms';
import Avatar from '$lib/components/avatar.svelte';
import { resolveRoute, withPath } from '$lib/stores/navigation';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div>You have reached the maximum number of functions for your plan.</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> `, 1);
var root_4 = $.from_html(`<span slot="tooltip"> </span>`);
var root_5 = $.from_html(`<p>Create a new function</p>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const $wizard = () => $.store_get(wizard, '$wizard', $$stores);
	const $canWriteFunctions = () => $.store_get(canWriteFunctions, '$canWriteFunctions', $$stores);
	const $updateCommandGroupRanks = () => $.store_get(updateCommandGroupRanks, '$updateCommandGroupRanks', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const data = $.prop($$props, 'data', 7);
	let offset = 0;

	const createFunctionsUrl = $.derived(() => {
		return resolveRoute('/(console)/project-[region]-[project]/functions/create-function', page.params);
	});

	const isLimited = $.derived(() => isServiceLimited('functions', $organization(), data().functions.total));

	onMount(async () => {
		const from = page.url.searchParams.get('from');

		if (from === 'github') {
			const to = page.url.searchParams.get('to');

			switch (to) {
				case 'template':
					{
						const template = page.url.searchParams.get('template');
						const templateConfig = page.url.searchParams.get('templateConfig');
						const templateUrl = resolveRoute('/(console)/project-[region]-[project]/functions/create-function/template-[template]', { ...page.params, template });

						if (!templateConfig) {
							await goto(templateUrl);
						} else {
							await goto(withPath(templateUrl, `?templateConfig=${templateConfig}`));
						}

						break;
					}

				case 'cover':
					await goto($.get(createFunctionsUrl));
					break;
			}
		}
	});

	function getNextScheduledExecution(func) {
		return toLocaleDateTime(parseExpression(func.schedule, { utc: true }).next().toString());
	}

	$.user_effect(() => {
		$registerCommands()([
			{
				label: 'Create function',
				callback: () => goto($.get(createFunctionsUrl)),
				keys: ['c'],
				disabled: $wizard().show || isServiceLimited('functions', $organization(), data().functions?.total) || !$canWriteFunctions(),
				icon: IconPlus,
				group: 'functions'
			}
		]);
	});

	$.user_effect(() => {
		$updateCommandGroupRanks()({ functions: 1000 });
	});

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						SearchQuery(node_1, { placeholder: 'Search by name or ID' });

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => !$.get(isLimited));

							Tooltip(node_2, {
								get disabled() {
									return $.get($0);
								},

								get maxWidth() {
									return BODY_TOOLTIP_MAX_WIDTH;
								},

								children: ($$anchor, $$slotProps) => {
									var div = root();
									var node_3 = $.child(div);

									Button(node_3, {
										get disabled() {
											return $.get(isLimited);
										},

										get href() {
											return $.get(createFunctionsUrl);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Create function');

											$.append($$anchor, text);
										},

										$$slots: {
											default: true,
											start: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconPlus;
													},
													slot: 'start'
												});
											}
										}
									});

									$.reset(div);
									$.append($$anchor, div);
								},

								$$slots: {
									default: true,
									tooltip: ($$anchor, $$slotProps) => {
										var div_1 = root_1();

										$.template_effect(() => $.set_style(div_1, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE));
										$.append($$anchor, div_1);
									}
								}
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_4 = root_2();
					var node_5 = $.first_child(fragment_4);

					{
						let $0 = $.derived(() => !$canWriteFunctions());

						CardContainer(node_5, {
							offset,
							get disableEmpty() {
								return $.get($0);
							},
							event: 'functions',
							get total() {
								return data().functions.total;
							},
							service: 'functions',
							$$events: { click: () => goto($.get(createFunctionsUrl)) },
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_6 = $.first_child(fragment_5);

								$.each(node_6, 17, () => data().functions.functions, (func) => func.$id, ($$anchor, func) => {
									{
										let $0 = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/functions/function-[function]', { ...page.params, function: $.get(func).$id }));

										GridItem1($$anchor, {
											get href() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												Id($$anchor, {
													get value() {
														return $.get(func).$id;
													},
													event: 'function',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $.get(func).$id));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											},

											$$slots: {
												default: true,
												title: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_7 = $.first_child(fragment_9);

													$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
														Layout_Stack_1($$anchor, {
															gap: 'l',
															alignItems: 'center',
															direction: 'row',
															inline: true,
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_3();
																var node_8 = $.first_child(fragment_10);

																Avatar(node_8, {
																	get alt() {
																		return $.get(func).name;
																	},
																	size: 'm',
																	children: ($$anchor, $$slotProps) => {
																		{
																			let $0 = $.derived(() => $.get(func).runtime.split('-')[0]);

																			SvgIcon($$anchor, {
																				get name() {
																					return $.get($0);
																				}
																			});
																		}
																	},
																	$$slots: { default: true }
																});

																var text_2 = $.sibling(node_8);

																$.template_effect(() => $.set_text(text_2, ` ${$.get(func).name ?? ''}`));
																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},

												icons: ($$anchor, $$slotProps) => {
													var fragment_12 = $.comment();
													var node_9 = $.first_child(fragment_12);

													{
														var consequent = ($$anchor) => {
															Tooltip($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		get icon() {
																			return IconClock;
																		},
																		size: 's'
																	});
																},

																$$slots: {
																	default: true,
																	tooltip: ($$anchor, $$slotProps) => {
																		var span = root_4();
																		var text_3 = $.only_child(span, true);

																		$.template_effect(($0) => $.set_text(text_3, $0), [
																			() => `Next execution:
                                        ${getNextScheduledExecution($.get(func))}`
																		]);

																		$.append($$anchor, span);
																	}
																}
															});
														};

														$.if(node_9, ($$render) => {
															if ($.get(func).schedule) $$render(consequent);
														});
													}

													$.append($$anchor, fragment_12);
												}
											}
										});
									}
								});

								$.append($$anchor, fragment_5);
							},

							$$slots: {
								default: true,
								empty: ($$anchor, $$slotProps) => {
									var p = root_5();

									$.append($$anchor, p);
								}
							}
						});
					}

					var node_10 = $.sibling(node_5, 2);

					PaginationWithLimit(node_10, {
						name: 'Functions',
						get limit() {
							return data().limit;
						},

						get offset() {
							return data().offset;
						},

						get total() {
							return data().functions.total;
						}
					});

					$.append($$anchor, fragment_4);
				};

				var consequent_2 = ($$anchor) => {
					EmptySearch($$anchor, {
						hidePages: true,
						target: 'functions',
						get search() {
							return data().search;
						},

						set search($$value) {
							data().search = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/functions', page.params));

								Button($$anchor, {
									secondary: true,
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Clear search');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						get allowCreate() {
							return $canWriteFunctions();
						},
						href: 'https://appwrite.io/docs/products/functions',
						target: 'function',
						$$events: { click: () => goto($.get(createFunctionsUrl)) }
					});
				};

				$.if(node_4, ($$render) => {
					if (data().functions.total) $$render(consequent_1); else if (data()?.search) $$render(consequent_2, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}