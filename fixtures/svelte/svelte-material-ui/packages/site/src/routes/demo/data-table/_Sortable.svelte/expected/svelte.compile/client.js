import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _Sortable($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));
	let sort = $.state('id');
	let sortDirection = $.state('ascending');

	if (typeof fetch !== 'undefined') {
		fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json').then((response) => response.json()).then((json) => $.set(items, json, true));
	}

	function handleSort() {
		$.get(items).sort((a, b) => {
			const [aVal, bVal] = [a[$.get(sort)], b[$.get(sort)]][$.get(sortDirection) === 'ascending' ? 'slice' : 'reverse']();

			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}

			return Number(aVal) - Number(bVal);
		});
	}

	DataTable($$anchor, {
		sortable: true,
		onSMUIDataTableSorted: handleSort,
		'table$aria-label': 'User list',
		style: 'width: 100%;',
		get sort() {
			return $.get(sort);
		},

		set sort($$value) {
			$.set(sort, $$value, true);
		},

		get sortDirection() {
			return $.get(sortDirection);
		},

		set sortDirection($$value) {
			$.set(sortDirection, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Head(node, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_1 = $.first_child(fragment_3);

							Cell(node_1, {
								numeric: true,
								columnId: 'id',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_2 = $.first_child(fragment_4);

									IconButton(node_2, {
										children: ($$anchor, $$slotProps) => {
											Icon($$anchor, {
												class: 'material-icons',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('arrow_upward');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									Label(node_3, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('ID');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_1, 2);

							Cell(node_4, {
								columnId: 'name',
								style: 'width: 100%;',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_5 = $.first_child(fragment_6);

									Label(node_5, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Name');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									IconButton(node_6, {
										children: ($$anchor, $$slotProps) => {
											Icon($$anchor, {
												class: 'material-icons',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('arrow_upward');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_4, 2);

							Cell(node_7, {
								columnId: 'username',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_8 = $.first_child(fragment_8);

									Label(node_8, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Username');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									IconButton(node_9, {
										children: ($$anchor, $$slotProps) => {
											Icon($$anchor, {
												class: 'material-icons',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('arrow_upward');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_7, 2);

							Cell(node_10, {
								columnId: 'email',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_11 = $.first_child(fragment_10);

									Label(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Email');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									IconButton(node_12, {
										children: ($$anchor, $$slotProps) => {
											Icon($$anchor, {
												class: 'material-icons',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('arrow_upward');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_10, 2);

							Cell(node_13, {
								sortable: false,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Website');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node, 2);

			Body(node_14, {
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = $.comment();
					var node_15 = $.first_child(fragment_12);

					$.each(node_15, 17, () => $.get(items), (item) => item.id, ($$anchor, item) => {
						Row($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_14 = root_1();
								var node_16 = $.first_child(fragment_14);

								Cell(node_16, {
									numeric: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(item).id));
										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								var node_17 = $.sibling(node_16, 2);

								Cell(node_17, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text();

										$.template_effect(() => $.set_text(text_10, $.get(item).name));
										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});

								var node_18 = $.sibling(node_17, 2);

								Cell(node_18, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text();

										$.template_effect(() => $.set_text(text_11, $.get(item).username));
										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});

								var node_19 = $.sibling(node_18, 2);

								Cell(node_19, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text();

										$.template_effect(() => $.set_text(text_12, $.get(item).email));
										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});

								var node_20 = $.sibling(node_19, 2);

								Cell(node_20, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text();

										$.template_effect(() => $.set_text(text_13, $.get(item).website));
										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_14);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}