import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let offset = 0;

		const createFunctionsUrl = $.derived(() => {
			return resolveRoute('/(console)/project-[region]-[project]/functions/create-function', page.params);
		});

		const isLimited = $.derived(() => isServiceLimited('functions', $.store_get($$store_subs ??= {}, '$organization', organization), data.functions.total));

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
						await goto(createFunctionsUrl());
						break;
				}
			}
		});

		function getNextScheduledExecution(func) {
			return toLocaleDateTime(parseExpression(func.schedule, { utc: true }).next().toString());
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							children: ($$renderer) => {
								SearchQuery($$renderer, { placeholder: 'Search by name or ID' });
								$$renderer.push(`<!----> `);

								Tooltip($$renderer, {
									disabled: !isLimited(),
									maxWidth: BODY_TOOLTIP_MAX_WIDTH,
									children: ($$renderer) => {
										$$renderer.push(`<div>`);

										Button($$renderer, {
											disabled: isLimited(),
											href: createFunctionsUrl(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create function`);
											},

											$$slots: {
												default: true,
												start: ($$renderer) => {
													Icon($$renderer, { icon: IconPlus, slot: 'start' });
												}
											}
										});

										$$renderer.push(`<!----></div>`);
									},

									$$slots: {
										default: true,
										tooltip: ($$renderer) => {
											{
												$$renderer.push(`<div${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>You have reached the maximum number of functions for your plan.</div>`);
											}
										}
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

					$$renderer.push(` `);

					if (data.functions.total) {
						$$renderer.push('<!--[0-->');

						CardContainer($$renderer, {
							offset,
							disableEmpty: !$.store_get($$store_subs ??= {}, '$canWriteFunctions', canWriteFunctions),
							event: 'functions',
							total: data.functions.total,
							service: 'functions',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(data.functions.functions);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let func = each_array[$$index];

									GridItem1($$renderer, {
										href: resolveRoute('/(console)/project-[region]-[project]/functions/function-[function]', { ...page.params, function: func.$id }),
										children: ($$renderer) => {
											Id($$renderer, {
												value: func.$id,
												event: 'function',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(func.$id)}`);
												},
												$$slots: { default: true }
											});
										},

										$$slots: {
											default: true,
											title: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'l',
															alignItems: 'center',
															direction: 'row',
															inline: true,
															children: ($$renderer) => {
																Avatar($$renderer, {
																	alt: func.name,
																	size: 'm',
																	children: ($$renderer) => {
																		SvgIcon($$renderer, { name: func.runtime.split('-')[0] });
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> ${$.escape(func.name)}`);
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

											icons: ($$renderer) => {
												{
													if (func.schedule) {
														$$renderer.push('<!--[0-->');

														Tooltip($$renderer, {
															children: ($$renderer) => {
																Icon($$renderer, { icon: IconClock, size: 's' });
															},

															$$slots: {
																default: true,
																tooltip: ($$renderer) => {
																	$$renderer.push(`<span slot="tooltip">${$.escape(`Next execution:
                                        ${getNextScheduledExecution(func)}`)}</span>`);
																}
															}
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

								$$renderer.push(`<!--]-->`);
							},

							$$slots: {
								default: true,
								empty: ($$renderer) => {
									{
										$$renderer.push(`<p>Create a new function</p>`);
									}
								}
							}
						});

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Functions',
							limit: data.limit,
							offset: data.offset,
							total: data.functions.total
						});

						$$renderer.push(`<!---->`);
					} else if (data?.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							hidePages: true,
							target: 'functions',
							get search() {
								return data.search;
							},

							set search($$value) {
								data.search = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								Button($$renderer, {
									secondary: true,
									href: resolveRoute('/(console)/project-[region]-[project]/functions', page.params),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear search`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							allowCreate: $.store_get($$store_subs ??= {}, '$canWriteFunctions', canWriteFunctions),
							href: 'https://appwrite.io/docs/products/functions',
							target: 'function'
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
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