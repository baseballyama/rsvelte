import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable, { Head, Body, Row, Cell, Pagination } from '@smui/data-table';
import Select, { Option } from '@smui/select';
import IconButton, { Icon } from '@smui/icon-button';
import { Label } from '@smui/common';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _Pagination($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));
	let perPage = $.state(10);
	let currentPage = $.state(0);
	const start = $.derived(() => $.get(currentPage) * $.get(perPage));
	const end = $.derived(() => Math.min($.get(start) + $.get(perPage), $.get(items).length));
	const slice = $.derived(() => $.get(items).slice($.get(start), $.get(end)));
	const lastPage = $.derived(() => Math.max(Math.ceil($.get(items).length / $.get(perPage)) - 1, 0));

	$.user_effect(() => {
		if ($.get(currentPage) > $.get(lastPage)) {
			$.set(currentPage, $.get(lastPage), true);
		}
	});

	if (typeof fetch !== 'undefined') {
		// Slice a few off the end to show how the
		// last page looks when it's not full.
		fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/todos.json').then((response) => response.json()).then((json) => $.set(items, json.slice(0, 197), true));
	}

	{
		const paginate = ($$anchor) => {
			{
				const rowsPerPage = ($$anchor) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Label(node, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Rows Per Page');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Select(node_1, {
						variant: 'outlined',
						noLabel: true,
						get value() {
							return $.get(perPage);
						},

						set value($$value) {
							$.set(perPage, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Option(node_2, {
								value: 10,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('10');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Option(node_3, {
								value: 25,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('25');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Option(node_4, {
								value: 100,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('100');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				};

				const total = ($$anchor) => {
					$.next();

					var text_4 = $.text();

					$.template_effect(() => $.set_text(text_4, `${$.get(start) + 1}-${$.get(end) ?? ''} of ${$.get(items).length ?? ''}`));
					$.append($$anchor, text_4);
				};

				Pagination($$anchor, {
					rowsPerPage,
					total,
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_2();
						var node_5 = $.first_child(fragment_5);

						{
							let $0 = $.derived(() => $.get(currentPage) === 0);

							IconButton(node_5, {
								action: 'first-page',
								title: 'First page',
								onclick: () => $.set(currentPage, 0),
								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('first_page');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => $.get(currentPage) === 0);

							IconButton(node_6, {
								action: 'prev-page',
								title: 'Prev page',
								onclick: () => $.update(currentPage, -1),
								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('chevron_left');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						var node_7 = $.sibling(node_6, 2);

						{
							let $0 = $.derived(() => $.get(currentPage) === $.get(lastPage));

							IconButton(node_7, {
								action: 'next-page',
								title: 'Next page',
								onclick: () => $.update(currentPage),
								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('chevron_right');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						var node_8 = $.sibling(node_7, 2);

						{
							let $0 = $.derived(() => $.get(currentPage) === $.get(lastPage));

							IconButton(node_8, {
								action: 'last-page',
								title: 'Last page',
								onclick: () => $.set(currentPage, $.get(lastPage), true),
								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										class: 'material-icons',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('last_page');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { rowsPerPage: true, total: true, default: true }
				});
			}
		};

		DataTable($$anchor, {
			'table$aria-label': 'Todo list',
			style: 'width: 100%;',
			paginate,
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_1();
				var node_9 = $.first_child(fragment_10);

				Head(node_9, {
					children: ($$anchor, $$slotProps) => {
						Row($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_2();
								var node_10 = $.first_child(fragment_12);

								Cell(node_10, {
									numeric: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('ID');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_10, 2);

								Cell(node_11, {
									style: 'width: 100%;',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text('Title');

										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});

								var node_12 = $.sibling(node_11, 2);

								Cell(node_12, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text('Completed');

										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								Cell(node_13, {
									numeric: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text('User ID');

										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_9, 2);

				Body(node_14, {
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = $.comment();
						var node_15 = $.first_child(fragment_13);

						$.each(node_15, 17, () => $.get(slice), (item) => item.id, ($$anchor, item) => {
							Row($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_2();
									var node_16 = $.first_child(fragment_15);

									Cell(node_16, {
										numeric: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_13 = $.text();

											$.template_effect(() => $.set_text(text_13, $.get(item).id));
											$.append($$anchor, text_13);
										},
										$$slots: { default: true }
									});

									var node_17 = $.sibling(node_16, 2);

									Cell(node_17, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text();

											$.template_effect(() => $.set_text(text_14, $.get(item).title));
											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Cell(node_18, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text();

											$.template_effect(() => $.set_text(text_15, $.get(item).completed ? 'Yes' : 'No'));
											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									Cell(node_19, {
										numeric: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text();

											$.template_effect(() => $.set_text(text_16, $.get(item).userId));
											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_10);
			},
			$$slots: { paginate: true, default: true }
		});
	}

	$.pop();
}