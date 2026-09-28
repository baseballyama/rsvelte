import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $queries = () => $.store_get(queries, '$queries', $$stores);
	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showExitModal = $.state(false);
	let formComponent;
	let isSubmitting = $.state($.proxy(writable(false)));
	let localQueries = $.state($.proxy(new Map()));
	const localTags = $.derived(() => Array.from($.get(localQueries).keys()));
	const timestamp = toLocalDateTimeISO(Date.now()).replace(/[:.]/g, '-').split('T').join('_').slice(0, -4);
	const collectionName = page.params.collection;
	const filename = `${collectionName}_${timestamp}.json`;
	let exportWithFilters = $.state(false);

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
		$.get(localQueries).delete(tag);
		$.set(localQueries, new Map($.get(localQueries)), true);
	}

	async function handleExport() {
		try {
			await sdk.forProject(page.params.region, page.params.project).migrations.createJSONExport({
				databaseId: page.params.database,
				collectionId: page.params.collection,
				filename,
				columns: [],
				queries: $.get(exportWithFilters) ? Array.from($.get(localQueries).values()) : [],
				notify: true
			});

			addNotification({
				type: 'success',
				message: 'JSON export has started. You will receive an email when it is ready.'
			});

			trackEvent(Submit.DatabaseExportCsv);
			await goto($.get(collectionUrl));
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.DatabaseExportCsv);
		}
	}

	onMount(() => {
		$.set(localQueries, new Map($queries()), true);
	});

	Wizard($$anchor, {
		title: 'Export JSON',
		columnSize: 's',
		get href() {
			return $.get(collectionUrl);
		},
		confirmExit: true,
		column: true,
		get showExitModal() {
			return $.get(showExitModal);
		},

		set showExitModal($$value) {
			$.set(showExitModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Form($$anchor, {
					onSubmit: handleExport,
					get isSubmitting() {
						return $.get(isSubmitting);
					},

					set isSubmitting($$value) {
						$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									Fieldset($$anchor, {
										legend: 'Export options',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_1 = $.first_child(fragment_4);

											$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_2 = $.first_child(fragment_5);

														$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																gap: 'm',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root();
																	var div = $.first_child(fragment_6);
																	let classes;
																	var node_3 = $.child(div);

																	{
																		let $0 = $.derived(() => $.get(localTags).length === 0);

																		InputCheckbox(node_3, {
																			id: 'exportWithFilters',
																			label: 'Export with filters',
																			description: 'Export documents that match the current collection filters',
																			get disabled() {
																				return $.get($0);
																			},

																			get checked() {
																				return $.get(exportWithFilters);
																			},

																			set checked($$value) {
																				$.set(exportWithFilters, $$value, true);
																			}
																		});
																	}

																	$.reset(div);

																	var node_4 = $.sibling(div, 2);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_7 = $.comment();
																			var node_5 = $.first_child(fragment_7);

																			$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																				Layout_Stack_3($$anchor, {
																					direction: 'row',
																					gap: 'xs',
																					alignItems: 'center',
																					style: 'padding-left: 1.75rem;',
																					wrap: 'wrap',
																					children: ($$anchor, $$slotProps) => {
																						TagList($$anchor, {
																							get tags() {
																								return $.get(localTags);
																							},

																							$$events: {
																								remove: (e) => {
																									removeLocalFilter(e.detail);
																								}
																							}
																						});
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
																		};

																		$.if(node_4, ($$render) => {
																			if ($.get(localTags).length > 0) $$render(consequent);
																		});
																	}

																	$.template_effect(() => classes = $.set_class(div, 1, 'svelte-1q4nj4s', null, classes, { 'disabled-checkbox': $.get(localTags).length === 0 }));
																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}),
				($$value) => formComponent = $$value,
				() => formComponent
			);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_9 = $.comment();
				var node_6 = $.first_child(fragment_9);

				$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
					Layout_Stack_4($$anchor, {
						justifyContent: 'flex-end',
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_1();
							var node_7 = $.first_child(fragment_10);

							Button(node_7, {
								fullWidthMobile: true,
								secondary: true,
								$$events: { click: () => $.set(showExitModal, true) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Cancel');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Button(node_8, {
								fullWidthMobile: true,
								get disabled() {
									return $isSubmitting();
								},
								$$events: { click: () => formComponent.triggerSubmit() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Export');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			}
		}
	});

	$.pop();
	$$cleanup();
}