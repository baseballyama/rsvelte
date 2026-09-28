import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<button class="bg-gray-100 text-sm text-blue-600 hover:text-blue-800 dark:bg-gray-600 dark:text-blue-200">Edit</button> <button class="bg-gray-100 text-sm text-green-600 hover:text-green-800 dark:bg-gray-600 dark:text-green-600">Duplicate</button> <button class="bg-gray-100 text-sm text-red-600 hover:text-red-800 dark:bg-gray-600 dark:text-red-600">Delete</button>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="p-6"><div class="mb-6 flex items-center justify-between"><h1 class="text-2xl font-bold dark:text-white">Product Management</h1> <!></div> <div class="mb-6 rounded p-4"><h3 class="mb-2 font-semibold dark:text-white">Quick Templates:</h3> <div class="flex gap-2"><!> <!> <!></div></div> <div class="overflow-x-auto"><!></div></div> <!>`, 1);

export default function Example1($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_3();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Button(node, {
		onclick: addNewProduct,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add New Product');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_1 = $.child(div_3);

	Button(node_1, {
		color: 'lime',
		onclick: () => createFromTemplate("SMARTPHONE", "APPLE"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('iPhone Template');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		color: 'indigo',
		onclick: () => createFromTemplate("SMARTPHONE", "SAMSUNG"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Samsung Phone');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		color: 'cyan',
		onclick: () => createFromTemplate("LAPTOP", "APPLE"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('MacBook Template');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_4 = $.child(div_4);

	Table(node_4, {
		hoverable: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_5 = $.first_child(fragment_1);

			TableHead(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					TableHeadCell(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Name');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					TableHeadCell(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Price');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					TableHeadCell(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Brand');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					TableHeadCell(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Category');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					TableHeadCell(node_10, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Discount');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					TableHeadCell(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Actions');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_5, 2);

			TableBody(node_12, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_13 = $.first_child(fragment_3);

					$.each(node_13, 17, () => products, $.index, ($$anchor, product) => {
						TableBodyRow($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_14 = $.first_child(fragment_5);

								TableBodyCell(node_14, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text();

										$.template_effect(() => $.set_text(text_10, $.get(product).name));
										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_14, 2);

								TableBodyCell(node_15, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text();

										$.template_effect(() => $.set_text(text_11, `$${$.get(product).price ?? ''}`));
										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});

								var node_16 = $.sibling(node_15, 2);

								TableBodyCell(node_16, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text();

										$.template_effect(() => $.set_text(text_12, $.get(product).technology));
										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});

								var node_17 = $.sibling(node_16, 2);

								TableBodyCell(node_17, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text();

										$.template_effect(() => $.set_text(text_13, $.get(product).category));
										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});

								var node_18 = $.sibling(node_17, 2);

								TableBodyCell(node_18, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_14 = $.text();

										$.template_effect(() => $.set_text(text_14, $.get(product).discount ? `${$.get(product).discount}%` : "None"));
										$.append($$anchor, text_14);
									},
									$$slots: { default: true }
								});

								var node_19 = $.sibling(node_18, 2);

								TableBodyCell(node_19, {
									class: 'space-x-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_1();
										var button = $.first_child(fragment_11);
										var button_1 = $.sibling(button, 2);
										var button_2 = $.sibling(button_1, 2);

										$.delegated('click', button, () => editProduct($.get(product)));
										$.delegated('click', button_1, () => duplicateProduct($.get(product)));
										$.delegated('click', button_2, () => deleteProduct($.get(product).id));
										$.append($$anchor, fragment_11);
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

	$.reset(div_4);
	$.reset(div);

	var node_20 = $.sibling(div, 2);

	ProductDrawer(node_20, {
		get title() {
			return drawerTitle;
		},

		get data() {
			return productData;
		},

		get additionalFields() {
			return additionalFields;
		},
		onsubmit: handleFormSubmit,
		get open() {
			return drawerOpen;
		},

		set open($$value) {
			drawerOpen = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);