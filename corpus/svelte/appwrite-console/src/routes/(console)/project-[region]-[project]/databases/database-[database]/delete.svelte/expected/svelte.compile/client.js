import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Modal } from '$lib/components';
import { Button, InputCheckbox } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { Query } from '@appwrite.io/console';
import { Spinner, Table } from '@appwrite.io/pink-svelte';
import { resolveRoute } from '$lib/stores/navigation';
import { getTerminologies } from '$database/(entity)';

var root_1 = $.from_html(`<div class="u-flex u-main-center"><!></div>`);
var root_2 = $.from_html(`<p class="text">Are you sure you want to delete <b> </b>?</p>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="loader is-small"></div>`);
var root_5 = $.from_html(`<div class="u-flex u-gap-16 u-cross-center"><button class="u-underline" type="button">Show more</button> <!></div>`);
var root_6 = $.from_html(`<button class="u-underline" type="button">Show less</button>`);
var root_7 = $.from_html(`<div class="u-flex-vertical u-gap-16"><!> <!></div>`);

var root_8 = $.from_html(
	`<p class="text" data-private=""><b>Once deleted, this database and its backups cannot be restored. This action is
                irreversible.</b></p> <div class="input-check-box-friction"><!></div>`,
	1
);

var root_9 = $.from_html(
	`The following tables and all data associated with <b> </b>, will be
            permanently deleted.`,
	1
);

var root_10 = $.from_html(`Are you sure you want to delete <b> </b>?`, 1);
var root_11 = $.from_html(`<p class="text" slot="description"><!></p>`);

export default function Delete($$anchor, $$props) {
	$.push($$props, true);

	let showDelete = $.prop($$props, 'showDelete', 15, false);
	let error = $.state(null);
	let confirmedDeletion = $.state(false);
	let isLoadingRowsCount = $.state(false);
	let entityItems = $.state($.proxy([]));
	let entities = $.state(null);
	const { databaseSdk } = getTerminologies();
	const database = $.derived(() => page.data.database);

	function buildQueries() {
		const queries = [Query.orderDesc('$updatedAt')];

		if ($.get(entityItems).length > 0) {
			queries.push(Query.limit(25));
			queries.push(Query.offset($.get(entityItems).length));
		} else {
			queries.push(Query.limit(3));
		}

		return queries;
	}

	async function listEntities() {
		// let's just wait...
		if ($.get(isLoadingRowsCount)) return;

		$.set(isLoadingRowsCount, true);

		try {
			const queries = buildQueries();

			$.set(entities, await databaseSdk.listEntities({ databaseId: page.params.database, queries }), true);

			const entityInfo = $.get(entities).entities.map((entity) => {
				return {
					id: entity.$id,
					name: entity.name,
					updatedAt: entity.$updatedAt
				};
			});

			$.set(entityItems, [...$.get(entityItems), ...entityInfo], true);
		} catch(err) {
			$.set(error, true);
		} finally {
			$.set(isLoadingRowsCount, false);
		}
	}

	const handleDelete = async () => {
		try {
			await databaseSdk.delete({ databaseId: page.params.database });
			showDelete(false);

			addNotification({
				type: 'success',
				message: `${$.get(database).name} has been deleted`
			});

			trackEvent(Submit.DatabaseDelete);
			await goto(resolveRoute('/(console)/project-[region]-[project]/databases', page.params));
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.DatabaseDelete);
		}
	};

	/* reset data on modal close */
	$.user_effect(() => {
		if (showDelete()) {
			if ($.get(entityItems).length === 0 && !$.get(entities)) {
				listEntities();
			}
		} else {
			$.set(entities, null);
			$.set(entityItems, [], true);
			$.set(error, false);
			$.set(confirmedDeletion, false);
		}
	});

	Modal($$anchor, {
		title: 'Delete database',
		onSubmit: handleDelete,
		get show() {
			return showDelete();
		},

		set show($$value) {
			showDelete($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root_1();
					var node_1 = $.child(div);

					Spinner(node_1, {});
					$.reset(div);
					$.append($$anchor, div);
				};

				var consequent_1 = ($$anchor) => {
					var p = root_2();
					var b = $.sibling($.child(p));
					var text = $.only_child(b, true);

					$.next();
					$.reset(p);
					$.template_effect(() => $.set_text(text, $.get(database).name));
					$.append($$anchor, p);
				};

				var consequent_5 = ($$anchor) => {
					var div_1 = root_7();
					var node_2 = $.child(div_1);

					$.component(node_2, () => Table.Root, ($$anchor, Table_Root) => {
						Table_Root($$anchor, {
							columns: 2,
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const root = $.derived(() => $$slotProps.root);
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.each(node_3, 17, () => $.get(entityItems), $.index, ($$anchor, table) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
											Table_Row_Base($$anchor, {
												get root() {
													return $.get(root);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_3();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(table).name));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																DualTimeView($$anchor, {
																	get time() {
																		return $.get(table).updatedAt;
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									});

									$.append($$anchor, fragment_2);
								},

								header: ($$anchor, $$slotProps) => {
									const root = $.derived(() => $$slotProps.root);
									var fragment_7 = root_3();
									var node_7 = $.first_child(fragment_7);

									$.component(node_7, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
										Table_Header_Cell($$anchor, {
											get root() {
												return $.get(root);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Table');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
										Table_Header_Cell_1($$anchor, {
											get root() {
												return $.get(root);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Last Updated');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								}
							}
						});
					});

					var node_9 = $.sibling(node_2, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_2 = root_5();
							var button = $.child(div_2);
							var node_10 = $.sibling(button, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_3 = root_4();

									$.append($$anchor, div_3);
								};

								$.if(node_10, ($$render) => {
									if ($.get(isLoadingRowsCount)) $$render(consequent_2);
								});
							}

							$.reset(div_2);
							$.delegated('click', button, listEntities);
							$.append($$anchor, div_2);
						};

						var consequent_4 = ($$anchor) => {
							var button_1 = root_6();

							$.delegated('click', button_1, () => {
								$.set(entityItems, $.get(entityItems).slice(0, 3), true);
							});

							$.append($$anchor, button_1);
						};

						$.if(node_9, ($$render) => {
							if ($.get(entityItems).length < $.get(entities).total) $$render(consequent_3); else if ($.get(entityItems).length > 25) $$render(consequent_4, 1);
						});
					}

					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node, ($$render) => {
					if ($.get(isLoadingRowsCount)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1); else if ($.get(entityItems).length > 0) $$render(consequent_5, 2);
				});
			}

			var node_11 = $.sibling(node, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_8 = root_8();
					var div_4 = $.sibling($.first_child(fragment_8), 2);
					var node_12 = $.child(div_4);

					InputCheckbox(node_12, {
						required: true,
						id: 'delete_database',
						label: 'I understand and confirm',
						get checked() {
							return $.get(confirmedDeletion);
						},

						set checked($$value) {
							$.set(confirmedDeletion, $$value, true);
						}
					});

					$.reset(div_4);
					$.append($$anchor, fragment_8);
				};

				$.if(node_11, ($$render) => {
					if (!$.get(isLoadingRowsCount)) $$render(consequent_6);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var p_1 = root_11();
				var node_13 = $.child(p_1);

				{
					var consequent_7 = ($$anchor) => {
						var fragment_9 = root_9();
						var b_1 = $.sibling($.first_child(fragment_9));
						var text_4 = $.only_child(b_1, true);

						$.next();
						$.template_effect(() => $.set_text(text_4, $.get(database).name));
						$.append($$anchor, fragment_9);
					};

					var alternate = ($$anchor) => {
						var fragment_10 = root_10();
						var b_2 = $.sibling($.first_child(fragment_10));
						var text_5 = $.only_child(b_2, true);

						$.next();
						$.template_effect(() => $.set_text(text_5, $.get(database).name));
						$.append($$anchor, fragment_10);
					};

					$.if(node_13, ($$render) => {
						if ($.get(entityItems).length > 0) $$render(consequent_7); else $$render(alternate, -1);
					});
				}

				$.reset(p_1);
				$.append($$anchor, p_1);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_11 = root_3();
				var node_14 = $.first_child(fragment_11);

				Button(node_14, {
					text: true,
					$$events: { click: () => showDelete(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Cancel');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				{
					let $0 = $.derived(() => !$.get(confirmedDeletion));

					Button(node_15, {
						danger: true,
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Delete');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_11);
			}
		}
	});

	$.pop();
}

$.delegate(['click']);