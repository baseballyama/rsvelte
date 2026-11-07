import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		onMount(() => {
			return realtime.forConsole(page.params.region, 'console', (response) => {
				if (response.events.includes('functions.*.executions.*')) {
					invalidate(Dependencies.EXECUTIONS);
				}
			});
		});

		Container($$renderer, {
			children: ($$renderer) => {
				ResponsiveContainerHeader($$renderer, {
					hasFilters: true,
					columns,
					hideView: true,
					analyticsSource: 'function_executions',
					children: ($$renderer) => {
						Tooltip($$renderer, {
							disabled: !!data.func?.deploymentId,
							maxWidth: BODY_TOOLTIP_MAX_WIDTH,
							children: ($$renderer) => {
								$$renderer.push(`<div>`);

								Button($$renderer, {
									event: 'execute_function',
									href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${data.func.$id}/executions/execute-function`,
									disabled: !data.func.$id || !data.func?.deploymentId,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create execution`);
									},

									$$slots: {
										default: true,
										start: ($$renderer) => {
											Icon($$renderer, { icon: IconPlus, size: 's', slot: 'start' });
										}
									}
								});

								$$renderer.push(`<!----></div>`);
							},

							$$slots: {
								default: true,
								tooltip: ($$renderer) => {
									$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>Execution cannot be created because there is no active deployment.</div>`);
								}
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (data?.executions?.total) {
					$$renderer.push('<!--[0-->');

					Table($$renderer, {
						columns: $.store_get($$store_subs ??= {}, '$columns', columns),
						executions: data.executions
					});

					$$renderer.push(`<!----> `);

					PaginationWithLimit($$renderer, {
						name: 'Executions',
						limit: data.limit,
						offset: data.offset,
						total: data.executions.total
					});

					$$renderer.push(`<!---->`);
				} else if (data?.query) {
					$$renderer.push('<!--[1-->');
					EmptyFilter($$renderer, { resource: 'executions' });
				} else {
					$$renderer.push('<!--[-1-->');

					Empty($$renderer, {
						single: true,
						target: 'execution',
						$$slots: {
							actions: ($$renderer) => {
								{
									Button($$renderer, {
										external: true,
										href: 'https://appwrite.io/docs/products/functions/execution',
										text: true,
										event: 'empty_documentation',
										size: 's',
										ariaLabel: 'read execution documentation',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Documentation`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Tooltip($$renderer, {
										disabled: !!data.func?.deploymentId,
										maxWidth: BODY_TOOLTIP_MAX_WIDTH,
										children: ($$renderer) => {
											$$renderer.push(`<div>`);

											Button($$renderer, {
												secondary: true,
												event: 'execute_function',
												href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${data.func.$id}/executions/execute-function`,
												disabled: !data.func.$id || !data.func?.deploymentId,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Create execution`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										},

										$$slots: {
											default: true,
											tooltip: ($$renderer) => {
												$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>Execution cannot be created because there is no active deployment.</div>`);
											}
										}
									});

									$$renderer.push(`<!---->`);
								}
							}
						}
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}