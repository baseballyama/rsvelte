import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Empty, EmptyFilter, PaginationWithLimit } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE } from '$lib/helpers/tooltipContent';
import { Button } from '$lib/elements/forms';
import { Container, ResponsiveContainerHeader } from '$lib/layout';
import { realtime } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { base } from '$app/paths';
import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import Table from './table.svelte';
import { columns } from './store';
import { page } from '$app/state';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div slot="tooltip">Execution cannot be created because there is no active deployment.</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	onMount(() => {
		return realtime.forConsole(page.params.region, 'console', (response) => {
			if (response.events.includes('functions.*.executions.*')) {
				invalidate(Dependencies.EXECUTIONS);
			}
		});
	});

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			ResponsiveContainerHeader(node, {
				hasFilters: true,
				get columns() {
					return columns;
				},
				hideView: true,
				analyticsSource: 'function_executions',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => !!$$props.data.func?.deploymentId);

						Tooltip($$anchor, {
							get disabled() {
								return $.get($0);
							},

							get maxWidth() {
								return BODY_TOOLTIP_MAX_WIDTH;
							},

							children: ($$anchor, $$slotProps) => {
								var div = root();
								var node_1 = $.child(div);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$$props.data.func.$id}/executions/execute-function`);
									let $1 = $.derived(() => !$$props.data.func.$id || !$$props.data.func?.deploymentId);

									Button(node_1, {
										event: 'execute_function',
										get href() {
											return $.get($0);
										},

										get disabled() {
											return $.get($1);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Create execution');

											$.append($$anchor, text);
										},

										$$slots: {
											default: true,
											start: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconPlus;
													},
													size: 's',
													slot: 'start'
												});
											}
										}
									});
								}

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
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = root_2();
					var node_3 = $.first_child(fragment_4);

					Table(node_3, {
						get columns() {
							return $columns();
						},

						get executions() {
							return $$props.data.executions;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PaginationWithLimit(node_4, {
						name: 'Executions',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.executions.total;
						}
					});

					$.append($$anchor, fragment_4);
				};

				var consequent_1 = ($$anchor) => {
					EmptyFilter($$anchor, { resource: 'executions' });
				};

				var alternate = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						target: 'execution',
						$$slots: {
							actions: ($$anchor, $$slotProps) => {
								var fragment_7 = root_2();
								var node_5 = $.first_child(fragment_7);

								Button(node_5, {
									external: true,
									href: 'https://appwrite.io/docs/products/functions/execution',
									text: true,
									event: 'empty_documentation',
									size: 's',
									ariaLabel: 'read execution documentation',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Documentation');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => !!$$props.data.func?.deploymentId);

									Tooltip(node_6, {
										get disabled() {
											return $.get($0);
										},

										get maxWidth() {
											return BODY_TOOLTIP_MAX_WIDTH;
										},

										children: ($$anchor, $$slotProps) => {
											var div_2 = root();
											var node_7 = $.child(div_2);

											{
												let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$$props.data.func.$id}/executions/execute-function`);
												let $1 = $.derived(() => !$$props.data.func.$id || !$$props.data.func?.deploymentId);

												Button(node_7, {
													secondary: true,
													event: 'execute_function',
													get href() {
														return $.get($0);
													},

													get disabled() {
														return $.get($1);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Create execution');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_2);
											$.append($$anchor, div_2);
										},

										$$slots: {
											default: true,
											tooltip: ($$anchor, $$slotProps) => {
												var div_3 = root_1();

												$.template_effect(() => $.set_style(div_3, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE));
												$.append($$anchor, div_3);
											}
										}
									});
								}

								$.append($$anchor, fragment_7);
							}
						}
					});
				};

				$.if(node_2, ($$render) => {
					if ($$props.data?.executions?.total) $$render(consequent); else if ($$props.data?.query) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}