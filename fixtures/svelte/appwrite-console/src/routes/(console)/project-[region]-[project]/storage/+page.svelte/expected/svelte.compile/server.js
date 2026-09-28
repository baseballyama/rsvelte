import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { Empty, PaginationWithLimit } from '$lib/components';
import Create from './create.svelte';
import { Container, ResponsiveContainerHeader } from '$lib/layout';
import { page } from '$app/state';
import { writable } from 'svelte/store';
import { canWriteBuckets } from '$lib/stores/roles';
import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';
import { columns } from './store';
import Grid from './grid.svelte';
import Table from './table.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { resolveRoute } from '$lib/stores/navigation';
import { isServiceLimited } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE } from '$lib/helpers/tooltipContent';

export let showCreateBucket = writable(false);

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		async function bucketCreated(event) {
			showCreateBucket.set(false);
			await goto(resolveRoute('/(console)/project-[region]-[project]/storage/bucket-[bucket]', { ...page.params, bucket: event.detail.$id }));
		}

		const isLimited = $.derived(() => isServiceLimited('buckets', $.store_get($$store_subs ??= {}, '$organization', organization), data.buckets.total));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					ResponsiveContainerHeader($$renderer, {
						columns,
						hasSearch: true,
						view: data.view,
						searchPlaceholder: 'Search by name or ID',
						children: ($$renderer) => {
							if ($.store_get($$store_subs ??= {}, '$canWriteBuckets', canWriteBuckets)) {
								$$renderer.push('<!--[0-->');

								Tooltip($$renderer, {
									disabled: !isLimited(),
									maxWidth: BODY_TOOLTIP_MAX_WIDTH,
									children: ($$renderer) => {
										$$renderer.push(`<div>`);

										Button($$renderer, {
											size: 's',
											event: 'create_bucket',
											disabled: isLimited(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create bucket`);
											},

											$$slots: {
												default: true,
												start: ($$renderer) => {
													Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
												}
											}
										});

										$$renderer.push(`<!----></div>`);
									},

									$$slots: {
										default: true,
										tooltip: ($$renderer) => {
											{
												$$renderer.push(`<div${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>You have reached the maximum number of buckets for your plan.</div>`);
											}
										}
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (data.buckets.total) {
						$$renderer.push('<!--[0-->');

						if (data.view === 'grid') {
							$$renderer.push('<!--[0-->');

							Grid($$renderer, {
								data,
								get showCreate() {
									return $.store_get($$store_subs ??= {}, '$showCreateBucket', showCreateBucket);
								},

								set showCreate($$value) {
									$.store_set(showCreateBucket, $$value);
									$$settled = false;
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
							Table($$renderer, { data });
						}

						$$renderer.push(`<!--]--> `);

						PaginationWithLimit($$renderer, {
							name: 'Buckets',
							limit: data.limit,
							offset: data.offset,
							total: data.buckets.total
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							href: 'https://appwrite.io/docs/products/storage',
							target: 'bucket'
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Create($$renderer, {
				get showCreate() {
					return $.store_get($$store_subs ??= {}, '$showCreateBucket', showCreateBucket);
				},

				set showCreate($$value) {
					$.store_set(showCreateBucket, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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