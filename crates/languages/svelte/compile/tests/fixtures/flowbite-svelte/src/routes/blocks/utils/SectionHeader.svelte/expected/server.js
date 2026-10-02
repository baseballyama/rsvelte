import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";

export default function SectionHeader($$renderer, $$props) {
	let {
		home = "Blocks",
		category,
		title,
		description,
		breadcrumb_title
	} = $$props;

	let headerCls = $.derived(() => breadcrumb_title
		? ""
		: "mx-auto max-w-8xl pt-8 px-4 lg:px-20 mx-auto max-w-8xl col-span-2 mb-2 lg:mb-0");

	let capitalized = $.derived(() => () => {
		if (category !== undefined) {
			const [first, ...rest] = category;

			return `${first.toUpperCase()}${rest.join("")}`;
		}

		return undefined;
	});

	const allowedDirs = ["application", "marketing", "publisher"];

	$$renderer.push(`<section><div${$.attr_class($.clsx(headerCls()))}>`);

	Breadcrumb($$renderer, {
		class: 'mb-3 flex',
		children: ($$renderer) => {
			BreadcrumbItem($$renderer, {
				href: '/blocks',
				home: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(home)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (category && allowedDirs.includes(category)) {
				$$renderer.push('<!--[0-->');

				BreadcrumbItem($$renderer, {
					href: `/blocks/${$.stringify(category)}`,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(capitalized()())} UI`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (breadcrumb_title) {
				$$renderer.push('<!--[0-->');

				BreadcrumbItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(breadcrumb_title)}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h1 class="mb-2 inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">${$.escape(title)}</h1> <p class="text-lg text-gray-500 lg:mb-0 dark:text-gray-400">${$.escape(description)}</p></div></section>`);
}