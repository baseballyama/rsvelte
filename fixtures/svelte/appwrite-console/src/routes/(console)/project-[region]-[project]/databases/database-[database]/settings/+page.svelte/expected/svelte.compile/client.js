import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { BoxAvatar, CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, Helper, InputText } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Container } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import Delete from '../delete.svelte';
import { Query } from '@appwrite.io/console';
import { Layout, Skeleton } from '@appwrite.io/pink-svelte';
import { getTerminologies } from '$database/(entity)';

var root = $.from_html(`<div class="grid-1-2-col-2"><p> </p> <p> </p></div>`);
var root_1 = $.from_html(`<ul><!> <!></ul>`);
var root_2 = $.from_html(`<h6 class="u-bold u-trim-1"> </h6> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const database = $.derived(() => $$props.data.database);
	let showDelete = $.state(false);
	let databaseName = $.state(null);
	let errorMessage = $.state('Something went wrong');
	let errorType = $.state('error');
	let showError = $.state(false);
	const { databaseSdk, terminology } = getTerminologies();

	onMount(async () => {
		$.set(databaseName, $.get(databaseName) ?? $.get(database).name, true);
	});

	async function loadEntityCount() {
		const { total } = await databaseSdk.listEntities({ databaseId: page.params.database, queries: [Query.limit(1)] });

		return total;
	}

	function addError(location, message, type) {
		$.set(errorType, type, true);
		$.set(showError, location, true);
		$.set(errorMessage, message, true);
	}

	async function updateName() {
		try {
			await sdk.forProject(page.params.region, page.params.project).tablesDB.update({ databaseId: page.params.database, name: $.get(databaseName) });
			await invalidate(Dependencies.DATABASE);
			addNotification({ message: 'Name has been updated', type: 'success' });
			trackEvent(Submit.DatabaseUpdateName);
		} catch(error) {
			addError('name', error.message, 'error');
			trackError(error, Submit.DatabaseUpdateName);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_4();
			var node_1 = $.first_child(fragment_1);

			Container(node_1, {
				databasesMainScreen: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_2 = $.first_child(fragment_2);

					CardGrid(node_2, {
						$$slots: {
							title: ($$anchor, $$slotProps) => {
								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(database).name));
								$.append($$anchor, text);
							},

							aside: ($$anchor, $$slotProps) => {
								var div = root();
								var p = $.child(div);
								var text_1 = $.only_child(p);
								var p_1 = $.sibling(p, 2);
								var text_2 = $.only_child(p_1);

								$.reset(div);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_1, `Created: ${$0 ?? ''}`);
										$.set_text(text_2, `Last updated: ${$1 ?? ''}`);
									},
									[
										() => toLocaleDateTime($.get(database).$createdAt),
										() => toLocaleDateTime($.get(database).$updatedAt)
									]
								);

								$.append($$anchor, div);
							}
						}
					});

					var node_3 = $.sibling(node_2, 2);

					Form(node_3, {
						onSubmit: updateName,
						children: ($$anchor, $$slotProps) => {
							CardGrid($$anchor, {
								$$slots: {
									title: ($$anchor, $$slotProps) => {
										var text_3 = $.text('Name');

										$.append($$anchor, text_3);
									},

									aside: ($$anchor, $$slotProps) => {
										var ul = root_1();
										var node_4 = $.child(ul);

										InputText(node_4, {
											id: 'name',
											label: 'Name',
											placeholder: 'Enter database name',
											autocomplete: false,
											required: true,
											get value() {
												return $.get(databaseName);
											},

											set value($$value) {
												$.set(databaseName, $$value, true);
											}
										});

										var node_5 = $.sibling(node_4, 2);

										{
											var consequent = ($$anchor) => {
												Helper($$anchor, {
													get type() {
														return $.get(errorType);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text();

														$.template_effect(() => $.set_text(text_4, $.get(errorMessage)));
														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_5, ($$render) => {
												if ($.get(showError) === 'name') $$render(consequent);
											});
										}

										$.reset(ul);
										$.append($$anchor, ul);
									},

									actions: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => $.get(databaseName) === $.get(database).name || !$.get(databaseName));

											Button($$anchor, {
												get disabled() {
													return $.get($0);
												},
												submit: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Update');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										}
									}
								}
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_3, 2);

					CardGrid(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, `The database will be permanently deleted, including all ${terminology.entity.lower.plural ?? ''} within it. This action is irreversible.`));
							$.append($$anchor, text_6);
						},

						$$slots: {
							default: true,
							title: ($$anchor, $$slotProps) => {
								var text_7 = $.text('Delete database');

								$.append($$anchor, text_7);
							},

							aside: ($$anchor, $$slotProps) => {
								BoxAvatar($$anchor, {
									$$slots: {
										title: ($$anchor, $$slotProps) => {
											var fragment_10 = $.comment();
											var node_7 = $.first_child(fragment_10);

											$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack) => {
												Layout_Stack($$anchor, {
													direction: 'column',
													gap: 'xxs',
													children: ($$anchor, $$slotProps) => {
														var fragment_11 = root_2();
														var h6 = $.first_child(fragment_11);
														var text_8 = $.only_child(h6, true);
														var node_8 = $.sibling(h6, 2);

														$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
															Layout_Stack_1($$anchor, {
																direction: 'row',
																gap: 's',
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_9 = $.first_child(fragment_12);

																	$.await(
																		node_9,
																		loadEntityCount,
																		($$anchor) => {
																			Skeleton($$anchor, { variant: 'line', width: '100%', height: 19.5 });
																		},
																		($$anchor, count) => {
																			const entity = $.derived(() => terminology.entity.title);
																			var text_9 = $.text();

																			$.template_effect(() => $.set_text(text_9, `${$.get(count) ?? ''}
                                    ${($.get(count) === 1 ? $.get(entity).singular : $.get(entity).plural) ?? ''}`));

																			$.append($$anchor, text_9);
																		}
																	);

																	$.append($$anchor, fragment_12);
																},
																$$slots: { default: true }
															});
														});

														$.template_effect(() => $.set_text(text_8, $.get(database).name));
														$.append($$anchor, fragment_11);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_10);
										}
									}
								});
							},

							actions: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									secondary: true,
									$$events: {
										click: () => {
											$.set(showDelete, true);
											trackEvent(Click.DatabaseDatabaseDelete);
										}
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text('Delete');

										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});
							}
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_1, 2);

			Delete(node_10, {
				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(database)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}