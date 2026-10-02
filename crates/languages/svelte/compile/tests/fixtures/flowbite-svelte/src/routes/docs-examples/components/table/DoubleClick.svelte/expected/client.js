import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	ImagePlaceholder,
	Modal
} from "flowbite-svelte";

import { slide } from "svelte/transition";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="px-2 py-3"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function DoubleClick($$anchor) {
	const items = [
		{
			name: 'Apple MacBook Pro 17"',
			color: "Silver",
			type: "Laptop",
			price: "$2999"
		},

		{
			name: "Microsoft Surface Pro",
			color: "White",
			type: "Laptop PC",
			price: "$1999"
		},

		{
			name: "Magic Mouse 2",
			color: "Black",
			type: "Accessories",
			price: "$99"
		}
	];

	let openRow = $.state(void 0);
	let details = $.state(void 0);
	let doubleClickModal = $.state(false);

	const toggleRow = (i) => {
		$.set(openRow, $.get(openRow) === i ? null : i, true);
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	Table(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			TableHead(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					TableHeadCell(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Product name');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					TableHeadCell(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Color');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					TableHeadCell(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Category');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					TableHeadCell(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Price');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			TableBody(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_7 = $.first_child(fragment_3);

					$.each(node_7, 17, () => items, $.index, ($$anchor, item, i) => {
						var fragment_4 = root_2();
						var node_8 = $.first_child(fragment_4);

						TableBodyRow(node_8, {
							onclick: () => toggleRow(i),
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_9 = $.first_child(fragment_5);

								TableBodyCell(node_9, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, $.get(item).name));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								TableBodyCell(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(item).color));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_10, 2);

								TableBodyCell(node_11, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text();

										$.template_effect(() => $.set_text(text_6, $.get(item).type));
										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});

								var node_12 = $.sibling(node_11, 2);

								TableBodyCell(node_12, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, $.get(item).price));
										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_8, 2);

						{
							var consequent = ($$anchor) => {
								TableBodyRow($$anchor, {
									ondblclick: () => {
										$.set(doubleClickModal, true);
										$.set(details, $.get(item), true);
									},

									children: ($$anchor, $$slotProps) => {
										TableBodyCell($$anchor, {
											colspan: 4,
											class: 'p-0',
											children: ($$anchor, $$slotProps) => {
												var div = root_1();
												var node_14 = $.child(div);

												ImagePlaceholder(node_14, {});
												$.reset(div);
												$.transition(3, div, () => slide, () => ({ duration: 300, axis: "y" }));
												$.append($$anchor, div);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							};

							$.if(node_13, ($$render) => {
								if ($.get(openRow) === i) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_4);
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(details)?.name);

		Modal(node_15, {
			get title() {
				return $.get($0);
			},
			autoclose: true,
			outsideclose: true,
			get open() {
				return $.get(doubleClickModal);
			},

			set open($$value) {
				$.set(doubleClickModal, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				ImagePlaceholder($$anchor, {});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
}