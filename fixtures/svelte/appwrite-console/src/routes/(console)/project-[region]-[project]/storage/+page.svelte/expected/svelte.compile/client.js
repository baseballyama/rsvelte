import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div>You have reached the maximum number of buckets for your plan.</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $canWriteBuckets = () => $.store_get(canWriteBuckets, '$canWriteBuckets', $$stores);
	const $showCreateBucket = () => $.store_get(showCreateBucket, '$showCreateBucket', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	async function bucketCreated(event) {
		showCreateBucket.set(false);
		await goto(resolveRoute('/(console)/project-[region]-[project]/storage/bucket-[bucket]', { ...page.params, bucket: event.detail.$id }));
	}

	const isLimited = $.derived(() => isServiceLimited('buckets', $organization(), $$props.data.buckets.total));
	var fragment = root_2();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			ResponsiveContainerHeader(node_1, {
				get columns() {
					return columns;
				},
				hasSearch: true,
				get view() {
					return $$props.data.view;
				},
				searchPlaceholder: 'Search by name or ID',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => !$.get(isLimited));

								Tooltip($$anchor, {
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
											size: 's',
											event: 'create_bucket',
											get disabled() {
												return $.get(isLimited);
											},
											$$events: { click: () => $.store_set(showCreateBucket, true) },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Create bucket');

												$.append($$anchor, text);
											},

											$$slots: {
												default: true,
												start: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconPlus;
														},
														slot: 'start',
														size: 's'
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
						};

						$.if(node_2, ($$render) => {
							if ($canWriteBuckets()) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_5 = root_2();
					var node_5 = $.first_child(fragment_5);

					{
						var consequent_1 = ($$anchor) => {
							Grid($$anchor, {
								get data() {
									return $$props.data;
								},

								get showCreate() {
									$.mark_store_binding();

									return $showCreateBucket();
								},

								set showCreate($$value) {
									$.store_set(showCreateBucket, $$value);
								}
							});
						};

						var alternate = ($$anchor) => {
							Table($$anchor, {
								get data() {
									return $$props.data;
								}
							});
						};

						$.if(node_5, ($$render) => {
							if ($$props.data.view === 'grid') $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					PaginationWithLimit(node_6, {
						name: 'Buckets',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.buckets.total;
						}
					});

					$.append($$anchor, fragment_5);
				};

				var alternate_1 = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						href: 'https://appwrite.io/docs/products/storage',
						target: 'bucket',
						$$events: { click: () => showCreateBucket.set(true) }
					});
				};

				$.if(node_4, ($$render) => {
					if ($$props.data.buckets.total) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	Create(node_7, {
		get showCreate() {
			$.mark_store_binding();

			return $showCreateBucket();
		},

		set showCreate($$value) {
			$.store_set(showCreateBucket, $$value);
		},
		$$events: { created: bucketCreated }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}