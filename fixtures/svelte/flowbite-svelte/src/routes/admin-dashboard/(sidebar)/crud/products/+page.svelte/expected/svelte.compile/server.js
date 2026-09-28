import * as $ from 'svelte/internal/server';

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

export default function _page($$renderer) {
	let open = false;
	let DrawerComponent = ProductDrawer;

	const toggle = (component) => {
		DrawerComponent = component;
		open = !open;
	};

	let current_product = {};
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		MetaTag($$renderer, { path, description, title, subtitle });
		$$renderer.push(`<!----> <main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800"><h1 class="hidden">CRUD: Products</h1> <div class="p-4">`);

		Breadcrumb($$renderer, {
			class: 'mb-5',
			children: ($$renderer) => {
				BreadcrumbItem($$renderer, {
					home: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					href: '/crud/products',
					children: ($$renderer) => {
						$$renderer.push(`<!---->E-commerce`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Products`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h1',
			class: 'text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->All products`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function end($$renderer) {
				$$renderer.push(`<div class="space-x-2">`);

				Button($$renderer, {
					class: 'whitespace-nowrap',
					onclick: () => (current_product = {}, toggle(ProductDrawer)),
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add new product`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			Toolbar($$renderer, {
				embedded: true,
				class: 'w-full py-4 text-gray-500 dark:text-gray-300',
				end,
				children: ($$renderer) => {
					Input($$renderer, {
						placeholder: 'Search for products',
						class: 'me-6 w-80 border xl:w-96'
					});

					$$renderer.push(`<!----> `);

					ToolbarButton($$renderer, {
						color: 'dark',
						class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
						children: ($$renderer) => {
							CogSolid($$renderer, { size: 'lg' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarButton($$renderer, {
						color: 'dark',
						class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
						children: ($$renderer) => {
							TrashBinSolid($$renderer, { size: 'lg' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarButton($$renderer, {
						color: 'dark',
						class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
						children: ($$renderer) => {
							ExclamationCircleSolid($$renderer, { size: 'lg' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarButton($$renderer, {
						color: 'dark',
						class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
						children: ($$renderer) => {
							DotsVerticalOutline($$renderer, { size: 'lg' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { end: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> `);

		Table($$renderer, {
			children: ($$renderer) => {
				TableHead($$renderer, {
					class: 'border-y border-gray-200 bg-gray-100 dark:border-gray-700',
					children: ($$renderer) => {
						TableHeadCell($$renderer, {
							class: 'w-4 p-4',
							children: ($$renderer) => {
								Checkbox($$renderer, {});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like([
							"Product Name",
							"Technology",
							"Description",
							"ID",
							"Price",
							"Discount",
							"Actions"
						]);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let title = each_array[$$index];

							TableHeadCell($$renderer, {
								class: 'ps-4 font-normal',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(title)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TableBody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(Products);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let product = each_array_1[$$index_1];

							TableBodyRow($$renderer, {
								class: 'text-base',
								children: ($$renderer) => {
									TableBodyCell($$renderer, {
										class: 'w-4 p-4',
										children: ($$renderer) => {
											Checkbox($$renderer, {});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'flex items-center space-x-6 p-4 whitespace-nowrap',
										children: ($$renderer) => {
											$$renderer.push(`<div class="text-sm font-normal text-gray-500 dark:text-gray-300"><div class="text-base font-semibold text-gray-900 dark:text-white">${$.escape(product.name)}</div> <div class="text-sm font-normal text-gray-500 dark:text-gray-300">${$.escape(product.category)}</div></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'p-4',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(product.technology)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'max-w-sm truncate overflow-hidden p-4 text-base font-normal text-gray-500 xl:max-w-xs dark:text-gray-300',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(product.description)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'p-4',
										children: ($$renderer) => {
											$$renderer.push(`<!---->#${$.escape(product.id)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'p-4',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(product.price)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'p-4',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(product.discount)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TableBodyCell($$renderer, {
										class: 'space-x-2',
										children: ($$renderer) => {
											Button($$renderer, {
												size: 'sm',
												class: 'gap-2 px-3',
												onclick: () => (current_product = product, toggle(ProductDrawer)),
												children: ($$renderer) => {
													EditOutline($$renderer, { size: 'sm' });
													$$renderer.push(`<!----> Update`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												color: 'red',
												size: 'sm',
												class: 'gap-2 px-3',
												onclick: () => toggle(DeleteDrawer),
												children: ($$renderer) => {
													TrashBinSolid($$renderer, { size: 'sm' });
													$$renderer.push(`<!----> Delete item`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></main> `);

		if (DrawerComponent) {
			$$renderer.push('<!--[-->');

			DrawerComponent($$renderer, {
				data: current_product,
				additionalFields,
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}