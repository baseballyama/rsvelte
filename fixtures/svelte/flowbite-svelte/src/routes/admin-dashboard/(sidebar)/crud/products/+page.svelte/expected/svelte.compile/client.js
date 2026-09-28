import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Breadcrumb,
	BreadcrumbItem,
	Button,
	Checkbox,
	Heading,
	Input,
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	Toolbar,
	ToolbarButton
} from "flowbite-svelte";

import {
	CogSolid,
	DotsVerticalOutline,
	EditOutline,
	ExclamationCircleSolid,
	TrashBinSolid
} from "flowbite-svelte-icons";

import Products from "../../../data/product.json";
import MetaTag from "../../../utils/MetaTag.svelte";
import { DeleteDrawer, ProductDrawer } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-x-2"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="text-sm font-normal text-gray-500 dark:text-gray-300"><div class="text-base font-semibold text-gray-900 dark:text-white"> </div> <div class="text-sm font-normal text-gray-500 dark:text-gray-300"> </div></div>`);
var root_5 = $.from_html(`<!> Update`, 1);
var root_6 = $.from_html(`<!> Delete item`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800"><h1 class="hidden">CRUD: Products</h1> <div class="p-4"><!> <!> <!></div> <!></main> <!>`, 1);

export default function _page($$anchor) {
	let open = $.state(false);
	let DrawerComponent = $.state($.proxy(ProductDrawer));

	const toggle = (component) => {
		$.set(DrawerComponent, component, true);
		$.set(open, !$.get(open));
	};

	let current_product = $.state($.proxy({}));
	const path = "/crud/products";
	const description = "CRUD products examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - CRUD Products";
	const subtitle = "CRUD Products";

	const additionalFields = [
		{
			name: "technology",
			label: "Technology/Brand",
			options: [
				{ value: "Angular", label: "Angular" },
				{ value: "React JS", label: "React JS" },
				{ value: "Svelte", label: "Svelte" },
				{ value: "Vue", label: "Vue" }
			]
		},

		{
			name: "category",
			label: "Category",
			options: [
				{ value: "Html templates", label: "HTML Templates" },
				{ value: "UI Kit", label: "UI Kit" },
				{ value: "Dashboard", label: "Dashboard" },
				{ value: "Component Library", label: "Component Library" }
			]
		},

		{
			name: "discount",
			label: "Discount",
			options: [
				{ value: "No", label: "No Discount" },
				{ value: "5%", label: "5% Off" },
				{ value: "10%", label: "10% Off" },
				{ value: "15%", label: "15% Off" },
				{ value: "20%", label: "20% Off" },
				{ value: "25%", label: "25% Off" }
			]
		}
	];

	var fragment = root_8();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var main = $.sibling(node, 2);
	var div = $.sibling($.child(main), 2);
	var node_1 = $.child(div);

	Breadcrumb(node_1, {
		class: 'mb-5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			BreadcrumbItem(node_2, {
				home: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			BreadcrumbItem(node_3, {
				href: '/crud/products',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('E-commerce');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			BreadcrumbItem(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Products');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Heading(node_5, {
		tag: 'h1',
		class: 'text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('All products');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	{
		const end = ($$anchor) => {
			var div_1 = root_1();
			var node_7 = $.child(div_1);

			Button(node_7, {
				class: 'whitespace-nowrap',
				onclick: () => ($.set(current_product, {}, true), toggle(ProductDrawer)),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Add new product');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		Toolbar(node_6, {
			embedded: true,
			class: 'w-full py-4 text-gray-500 dark:text-gray-300',
			end,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_8 = $.first_child(fragment_2);

				Input(node_8, {
					placeholder: 'Search for products',
					class: 'me-6 w-80 border xl:w-96'
				});

				var node_9 = $.sibling(node_8, 2);

				ToolbarButton(node_9, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						CogSolid($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				ToolbarButton(node_10, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						TrashBinSolid($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				ToolbarButton(node_11, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						ExclamationCircleSolid($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				ToolbarButton(node_12, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						DotsVerticalOutline($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { end: true, default: true }
		});
	}

	$.reset(div);

	var node_13 = $.sibling(div, 2);

	Table(node_13, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_3();
			var node_14 = $.first_child(fragment_7);

			TableHead(node_14, {
				class: 'border-y border-gray-200 bg-gray-100 dark:border-gray-700',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_3();
					var node_15 = $.first_child(fragment_8);

					TableHeadCell(node_15, {
						class: 'w-4 p-4',
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					$.each(
						node_16,
						16,
						() => [
							"Product Name",
							"Technology",
							"Description",
							"ID",
							"Price",
							"Discount",
							"Actions"
						],
						$.index,
						($$anchor, title, $$index, $$array) => {
							TableHeadCell($$anchor, {
								class: 'ps-4 font-normal',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text();

									$.template_effect(() => $.set_text(text_5, title));
									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						}
					);

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_14, 2);

			TableBody(node_17, {
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = $.comment();
					var node_18 = $.first_child(fragment_12);

					$.each(node_18, 17, () => Products, $.index, ($$anchor, product) => {
						TableBodyRow($$anchor, {
							class: 'text-base',
							children: ($$anchor, $$slotProps) => {
								var fragment_14 = root_7();
								var node_19 = $.first_child(fragment_14);

								TableBodyCell(node_19, {
									class: 'w-4 p-4',
									children: ($$anchor, $$slotProps) => {
										Checkbox($$anchor, {});
									},
									$$slots: { default: true }
								});

								var node_20 = $.sibling(node_19, 2);

								TableBodyCell(node_20, {
									class: 'flex items-center space-x-6 p-4 whitespace-nowrap',
									children: ($$anchor, $$slotProps) => {
										var div_2 = root_4();
										var div_3 = $.child(div_2);
										var text_6 = $.only_child(div_3, true);
										var div_4 = $.sibling(div_3, 2);
										var text_7 = $.only_child(div_4, true);

										$.reset(div_2);

										$.template_effect(() => {
											$.set_text(text_6, $.get(product).name);
											$.set_text(text_7, $.get(product).category);
										});

										$.append($$anchor, div_2);
									},
									$$slots: { default: true }
								});

								var node_21 = $.sibling(node_20, 2);

								TableBodyCell(node_21, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(product).technology));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});

								var node_22 = $.sibling(node_21, 2);

								TableBodyCell(node_22, {
									class: 'max-w-sm truncate overflow-hidden p-4 text-base font-normal text-gray-500 xl:max-w-xs dark:text-gray-300',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(product).description));
										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								var node_23 = $.sibling(node_22, 2);

								TableBodyCell(node_23, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text();

										$.template_effect(() => $.set_text(text_10, `#${$.get(product).id ?? ''}`));
										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});

								var node_24 = $.sibling(node_23, 2);

								TableBodyCell(node_24, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text();

										$.template_effect(() => $.set_text(text_11, $.get(product).price));
										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});

								var node_25 = $.sibling(node_24, 2);

								TableBodyCell(node_25, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text();

										$.template_effect(() => $.set_text(text_12, $.get(product).discount));
										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});

								var node_26 = $.sibling(node_25, 2);

								TableBodyCell(node_26, {
									class: 'space-x-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root_3();
										var node_27 = $.first_child(fragment_21);

										Button(node_27, {
											size: 'sm',
											class: 'gap-2 px-3',
											onclick: () => (
												$.set(current_product, $.get(product), true),
												toggle(ProductDrawer)
											),

											children: ($$anchor, $$slotProps) => {
												var fragment_22 = root_5();
												var node_28 = $.first_child(fragment_22);

												EditOutline(node_28, { size: 'sm' });
												$.next();
												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});

										var node_29 = $.sibling(node_27, 2);

										Button(node_29, {
											color: 'red',
											size: 'sm',
											class: 'gap-2 px-3',
											onclick: () => toggle(DeleteDrawer),
											children: ($$anchor, $$slotProps) => {
												var fragment_23 = root_6();
												var node_30 = $.first_child(fragment_23);

												TrashBinSolid(node_30, { size: 'sm' });
												$.next();
												$.append($$anchor, fragment_23);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_21);
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

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(main);

	var node_31 = $.sibling(main, 2);

	$.component(node_31, () => $.get(DrawerComponent), ($$anchor, DrawerComponent_1) => {
		DrawerComponent_1($$anchor, {
			get data() {
				return $.get(current_product);
			},

			get additionalFields() {
				return additionalFields;
			},

			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			}
		});
	});

	$.append($$anchor, fragment);
}