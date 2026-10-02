import * as $ from 'svelte/internal/server';

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

export default function DoubleClick($$renderer) {
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

	let openRow = void 0;
	let details = void 0;
	let doubleClickModal = false;

	const toggleRow = (i) => {
		openRow = openRow === i ? null : i;
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Table($$renderer, {
			children: ($$renderer) => {
				TableHead($$renderer, {
					children: ($$renderer) => {
						TableHeadCell($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Product name`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TableHeadCell($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TableHeadCell($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Category`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TableHeadCell($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Price`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TableBody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let item = each_array[i];

							TableBodyRow($$renderer, {
								onclick: () => toggleRow(i),
								children: ($$renderer) => {
									TableBodyCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.name)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.color)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.type)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.price)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							if (openRow === i) {
								$$renderer.push('<!--[0-->');

								TableBodyRow($$renderer, {
									ondblclick: () => {
										doubleClickModal = true;
										details = item;
									},

									children: ($$renderer) => {
										TableBodyCell($$renderer, {
											colspan: 4,
											class: 'p-0',
											children: ($$renderer) => {
												$$renderer.push(`<div class="px-2 py-3">`);
												ImagePlaceholder($$renderer, {});
												$$renderer.push(`<!----></div>`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			title: details?.name,
			autoclose: true,
			outsideclose: true,
			get open() {
				return doubleClickModal;
			},

			set open($$value) {
				doubleClickModal = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ImagePlaceholder($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}