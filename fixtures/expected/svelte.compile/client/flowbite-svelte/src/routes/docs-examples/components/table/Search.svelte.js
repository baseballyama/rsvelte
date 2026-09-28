import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	TableSearch
} from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	let searchTerm = $.state("");

	let items = [
		{ id: 1, maker: "Toyota", type: "ABC", make: 2017 },
		{ id: 2, maker: "Ford", type: "CDE", make: 2018 },
		{ id: 3, maker: "Volvo", type: "FGH", make: 2019 },
		{ id: 4, maker: "Saab", type: "IJK", make: 2020 }
	];

	let filteredItems = $.derived(() => items.filter((item) => !$.get(searchTerm) || item.maker.toLowerCase().includes($.get(searchTerm).toLowerCase())));

	TableSearch($$anchor, {
		placeholder: 'Search by maker name',
		hoverable: true,
		get inputValue() {
			return $.get(searchTerm);
		},

		set inputValue($$value) {
			$.set(searchTerm, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			TableHead(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					TableHeadCell(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('ID');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					TableHeadCell(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Maker');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Type');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					TableHeadCell(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Make');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			TableBody(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.each(node_6, 17, () => $.get(filteredItems), $.index, ($$anchor, item) => {
						TableBodyRow($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_7 = $.first_child(fragment_5);

								TableBodyCell(node_7, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, $.get(item).id));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_8 = $.sibling(node_7, 2);

								TableBodyCell(node_8, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(item).maker));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								TableBodyCell(node_9, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text();

										$.template_effect(() => $.set_text(text_6, $.get(item).type));
										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								TableBodyCell(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, $.get(item).make));
										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}