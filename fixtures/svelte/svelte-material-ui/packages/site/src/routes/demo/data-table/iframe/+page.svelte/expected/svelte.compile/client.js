import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));

	if (typeof fetch !== 'undefined') {
		fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json').then((response) => response.json()).then((json) => $.set(items, json, true));
	}

	DataTable($$anchor, {
		stickyHeader: true,
		'table$aria-label': 'User list',
		style: 'width: 100%;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Head(node, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Cell(node_1, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('ID');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Cell(node_2, {
								style: 'width: 100%;',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Name');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Cell(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Username');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Cell(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Email');

									$.append($$anchor, text_3);
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

			var node_5 = $.sibling(node, 2);

			Body(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_6 = $.first_child(fragment_4);

					$.each(node_6, 17, () => $.get(items), (item) => item.id, ($$anchor, item) => {
						Row($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_7 = $.first_child(fragment_6);

								Cell(node_7, {
									numeric: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, $.get(item).id));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_8 = $.sibling(node_7, 2);

								Cell(node_8, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(item).name));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								Cell(node_9, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text();

										$.template_effect(() => $.set_text(text_6, $.get(item).username));
										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								Cell(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, $.get(item).email));
										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}