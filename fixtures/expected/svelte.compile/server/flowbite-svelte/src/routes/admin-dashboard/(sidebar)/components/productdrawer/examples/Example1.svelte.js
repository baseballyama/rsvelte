import * as $ from 'svelte/internal/server';
import { ProductDrawer } from "flowbite-svelte-admin-dashboard";

import {
	Button,
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell
} from "flowbite-svelte";

export default function Example1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Types
		// State
		let drawerOpen = false;

		let productData;
		let drawerTitle = "";
		let editingProductId = null;

		// Products database
		let products = [
			{
				id: 1,
				name: "iPhone 15 Pro",
				price: "1199",
				technology: "APPLE",
				category: "SMARTPHONE",
				description: "Latest iPhone with titanium design and A17 Pro chip",
				discount: "5"
			},

			{
				id: 2,
				name: "MacBook Air M3",
				price: "1299",
				technology: "APPLE",
				category: "LAPTOP",
				description: "Lightweight laptop with M3 chip and 18-hour battery life",
				discount: "10"
			},

			{
				id: 3,
				name: "Samsung Galaxy S24",
				price: "899",
				technology: "SAMSUNG",
				category: "SMARTPHONE",
				description: "AI-powered smartphone with excellent camera",
				discount: ""
			}
		];

		// Form configuration
		const additionalFields = [
			{
				name: "technology",
				label: "Technology/Brand",
				placeholder: "Select brand",
				options: [
					{ value: "APPLE", label: "Apple" },
					{ value: "SAMSUNG", label: "Samsung" },
					{ value: "GOOGLE", label: "Google" },
					{ value: "MICROSOFT", label: "Microsoft" }
				]
			},

			{
				name: "category",
				label: "Category",
				placeholder: "Select category",
				options: [
					{ value: "SMARTPHONE", label: "Smartphone" },
					{ value: "LAPTOP", label: "Laptop" },
					{ value: "TABLET", label: "Tablet" },
					{ value: "ACCESSORY", label: "Accessory" }
				]
			},

			{
				name: "discount",
				label: "Discount",
				placeholder: "No discount",
				options: [
					{ value: "5", label: "5% Off" },
					{ value: "10", label: "10% Off" },
					{ value: "15", label: "15% Off" },
					{ value: "20", label: "20% Off" },
					{ value: "25", label: "25% Off" }
				]
			}
		];

		// Helper function to get form data
		function getFormData(formData) {
			return {
				name: String(formData.get("name") || ""),
				price: String(formData.get("price") || ""),
				technology: String(formData.get("technology") || ""),
				category: String(formData.get("category") || ""),
				description: String(formData.get("description") || ""),
				discount: String(formData.get("discount") || "")
			};
		}

		// Helper function to generate new ID
		function generateNewId() {
			return products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
		}

		// Actions
		function addNewProduct() {
			editingProductId = null;
			productData = undefined;
			drawerTitle = "Add New Product";
			drawerOpen = true;
		}

		function editProduct(product) {
			editingProductId = product.id;

			productData = {
				name: product.name,
				price: product.price,
				technology: product.technology,
				category: product.category,
				description: product.description,
				discount: product.discount
			};

			drawerTitle = "Edit Product";
			drawerOpen = true;
		}

		function duplicateProduct(product) {
			editingProductId = null;

			productData = {
				name: `Copy of ${product.name}`,
				price: product.price,
				technology: product.technology,
				category: product.category,
				description: product.description,
				discount: ""
			};

			drawerTitle = "Duplicate Product";
			drawerOpen = true;
		}

		function createFromTemplate(category, technology) {
			editingProductId = null;

			productData = {
				name: "",
				price: "",
				technology,
				category,
				description: `New ${category.toLowerCase()} product`,
				discount: ""
			};

			drawerTitle = `Add New ${category}`;
			drawerOpen = true;
		}

		function handleFormSubmit(event) {
			event.preventDefault();

			const form = event.target;
			const formData = new FormData(form);
			const data = getFormData(formData);

			if (editingProductId !== null) {
				// Update existing product
				products = products.map((product) => product.id === editingProductId ? { ...product, ...data } : product);

				console.log("Updated product:", editingProductId);
			} else {
				// Create new product
				const newProduct = { id: generateNewId(), ...data };

				products = [...products, newProduct];
				console.log("Created new product:", newProduct);
			}

			// Reset and close
			editingProductId = null;

			productData = undefined;
			drawerOpen = false;
		}

		function deleteProduct(productId) {
			if (confirm("Are you sure you want to delete this product?")) {
				products = products.filter((p) => p.id !== productId);
				console.log("Deleted product:", productId);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="p-6"><div class="mb-6 flex items-center justify-between"><h1 class="text-2xl font-bold dark:text-white">Product Management</h1> `);

			Button($$renderer, {
				onclick: addNewProduct,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add New Product`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="mb-6 rounded p-4"><h3 class="mb-2 font-semibold dark:text-white">Quick Templates:</h3> <div class="flex gap-2">`);

			Button($$renderer, {
				color: 'lime',
				onclick: () => createFromTemplate("SMARTPHONE", "APPLE"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->iPhone Template`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'indigo',
				onclick: () => createFromTemplate("SMARTPHONE", "SAMSUNG"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Samsung Phone`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'cyan',
				onclick: () => createFromTemplate("LAPTOP", "APPLE"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->MacBook Template`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div class="overflow-x-auto">`);

			Table($$renderer, {
				hoverable: true,
				children: ($$renderer) => {
					TableHead($$renderer, {
						children: ($$renderer) => {
							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Name`);
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

							$$renderer.push(`<!----> `);

							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Brand`);
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
									$$renderer.push(`<!---->Discount`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHeadCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Actions`);
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

							const each_array = $.ensure_array_like(products);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let product = each_array[$$index];

								TableBodyRow($$renderer, {
									children: ($$renderer) => {
										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(product.name)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->$${$.escape(product.price)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(product.technology)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(product.category)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(product.discount ? `${product.discount}%` : "None")}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'space-x-2',
											children: ($$renderer) => {
												$$renderer.push(`<button class="bg-gray-100 text-sm text-blue-600 hover:text-blue-800 dark:bg-gray-600 dark:text-blue-200">Edit</button> <button class="bg-gray-100 text-sm text-green-600 hover:text-green-800 dark:bg-gray-600 dark:text-green-600">Duplicate</button> <button class="bg-gray-100 text-sm text-red-600 hover:text-red-800 dark:bg-gray-600 dark:text-red-600">Delete</button>`);
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

			$$renderer.push(`<!----></div></div> `);

			ProductDrawer($$renderer, {
				title: drawerTitle,
				data: productData,
				additionalFields,
				onsubmit: handleFormSubmit,
				get open() {
					return drawerOpen;
				},

				set open($$value) {
					drawerOpen = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}