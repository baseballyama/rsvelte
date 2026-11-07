import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem, Heading } from "flowbite-svelte";
import { EmptyCard } from "flowbite-svelte-admin-dashboard";

export default function Playground($$renderer) {
	$$renderer.push(`<main><div class="grid grid-cols-1 pt-2 xl:grid-cols-3 xl:gap-4 xl:px-0 dark:bg-gray-900"><div class="col-span-full mb-4 xl:mb-2">`);

	Breadcrumb($$renderer, {
		class: 'mb-5',
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
					$$renderer.push(`<!---->Pages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Playground`);
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
		class: 'text-xl font-semibold sm:text-2xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Create something awesome here`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="col-span-full xl:col-auto">`);

	EmptyCard($$renderer, {
		size: 'xl',
		class: 'mb-4 h-80 w-full space-y-6 p-4 2xl:col-span-2'
	});

	$$renderer.push(`<!----> `);

	EmptyCard($$renderer, {
		size: 'xl',
		class: 'mb-4 h-80 w-full space-y-6 p-4 2xl:col-span-2'
	});

	$$renderer.push(`<!----></div> <div class="col-span-2">`);
	EmptyCard($$renderer, { size: undefined, class: 'mb-4 h-80 max-w-none space-y-6 p-4' });
	$$renderer.push(`<!----> `);

	EmptyCard($$renderer, {
		size: undefined,
		class: 'mb-4 h-80 w-full max-w-none space-y-6 p-4'
	});

	$$renderer.push(`<!----></div></div> <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><!--[-->`);

	const each_array = $.ensure_array_like(Array(4));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let _ = each_array[$$index];

		EmptyCard($$renderer, { size: 'xl', class: 'h-60 w-full space-y-6 sm:p-6' });
	}

	$$renderer.push(`<!--]--></div></main>`);
}