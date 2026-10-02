import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { Wizard } from '$lib/layout';
import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
import { Button, InputCheckbox, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { toLocalDateTimeISO } from '$lib/helpers/date';
import { writable } from 'svelte/store';
import { queries } from '$lib/components/filters/store';
import { TagList } from '$lib/components/filters';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showExitModal = false;
		let formComponent;
		let isSubmitting = writable(false);
		let localQueries = new Map();
		const localTags = $.derived(() => Array.from(localQueries.keys()));
		const timestamp = toLocalDateTimeISO(Date.now()).replace(/[:.]/g, '-').split('T').join('_').slice(0, -4);
		const collectionName = page.params.collection;
		const filename = `${collectionName}_${timestamp}.json`;
		let exportWithFilters = false;

		const collectionUrl = $.derived(() => {
			const queryParam = page.url.searchParams.get('query');

			const url = resolve('/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]', {
				region: page.params.region,
				project: page.params.project,
				database: page.params.database,
				collection: page.params.collection
			});

			return queryParam
				? `${url}?query=${encodeURIComponent(queryParam)}`
				: url;
		});

		function removeLocalFilter(tag) {
			localQueries.delete(tag);
			localQueries = new Map(localQueries);
		}

		async function handleExport() {
			try {
				await sdk.forProject(page.params.region, page.params.project).migrations.createJSONExport({
					databaseId: page.params.database,
					collectionId: page.params.collection,
					filename,
					columns: [],
					queries: exportWithFilters ? Array.from(localQueries.values()) : [],
					notify: true
				});

				addNotification({
					type: 'success',
					message: 'JSON export has started. You will receive an email when it is ready.'
				});

				trackEvent(Submit.DatabaseExportCsv);
				await goto(collectionUrl());
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.DatabaseExportCsv);
			}
		}

		onMount(() => {
			localQueries = new Map($.store_get($$store_subs ??= {}, '$queries', queries));
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Export JSON',
				columnSize: 's',
				href: collectionUrl(),
				confirmExit: true,
				column: true,
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: handleExport,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										Fieldset($$renderer, {
											legend: 'Export options',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'm',
																	children: ($$renderer) => {
																		$$renderer.push(`<div${$.attr_class('svelte-1q4nj4s', void 0, { 'disabled-checkbox': localTags().length === 0 })}>`);

																		InputCheckbox($$renderer, {
																			id: 'exportWithFilters',
																			label: 'Export with filters',
																			description: 'Export documents that match the current collection filters',
																			disabled: localTags().length === 0,
																			get checked() {
																				return exportWithFilters;
																			},

																			set checked($$value) {
																				exportWithFilters = $$value;
																				$$settled = false;
																			}
																		});

																		$$renderer.push(`<!----></div> `);

																		if (localTags().length > 0) {
																			$$renderer.push('<!--[0-->');

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					gap: 'xs',
																					alignItems: 'center',
																					style: 'padding-left: 1.75rem;',
																					wrap: 'wrap',
																					children: ($$renderer) => {
																						TagList($$renderer, { tags: localTags() });
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
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									justifyContent: 'flex-end',
									direction: 'row',
									children: ($$renderer) => {
										Button($$renderer, {
											fullWidthMobile: true,
											secondary: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											fullWidthMobile: true,
											disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Export`);
											},
											$$slots: { default: true }
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