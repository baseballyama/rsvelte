import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem, Button } from "flowbite-svelte";

export default function Class($$renderer) {
	let navClass = "";

	const changeNavClass = () => {
		navClass = navClass === "" ? "border border-red-500 p-2" : "";
	};

	let olClass = "";

	const changeOlClass = () => {
		olClass = olClass === "" ? "border border-blue-500 p-2" : "";
	};

	$$renderer.push(`<div class="h-20">`);

	Breadcrumb($$renderer, {
		class: navClass,
		olClass,
		children: ($$renderer) => {
			BreadcrumbItem($$renderer, {
				href: '/',
				home: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Home`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Projects`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Flowbite Svelte`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

	Button($$renderer, {
		class: 'w-48',
		onclick: changeNavClass,
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(navClass ? "Remove navClass" : "Add navClass")}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'w-48',
		color: 'green',
		onclick: changeOlClass,
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(olClass ? "Remove olClass" : "Add olClass")}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}