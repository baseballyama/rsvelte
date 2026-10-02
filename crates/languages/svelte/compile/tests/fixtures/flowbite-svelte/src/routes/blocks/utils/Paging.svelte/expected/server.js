import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { PaginationItem } from "flowbite-svelte";
import ArrowLeft from "./icons/ArrowLeft.svelte";
import ArrowRight from "./icons/ArrowRight.svelte";

export default function Paging($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		// Optional property with string type (might not exist in all posts)
		// ... other properties in the meta object (add more if known)
		const { data, url, params: { slug } } = page;

		// two kinds of data. One from src/routes/+layout.js with posts
		// one from src/routes/applications(marketing, examples, publisher)/[slug]/+page.js content, title, dir
		// console.log('data.dir: ',data.dir)
		// console.log('data: ',data)
		const components = Object.values(data.posts).flat().// .filter((x) => x.meta.dir === data.dir)
		filter((x) => x.meta && x.meta.dir === data.dir).map(({ path, meta }) => ({ path, name: meta.breadcrumb_title }));

		// console.log('components: ', components )
		const index = components.findIndex((x) => x.path === "/" + slug);

		// console.log('index: ', index)
		function sibling(next) {
			const i = next ? index + 1 : index - 1,
				{ path, name } = components[i],
				href = "" + new URL(path.slice(1), url);

			return { href, name };
		}

		$$renderer.push(`<div class="flex flex-col items-start gap-4 py-4">`);

		if (index >= 1) {
			$$renderer.push(`<!--[0--><div class="flex flex-row justify-between gap-2.5 self-stretch">`);

			if (index > 1) {
				$$renderer.push('<!--[0-->');

				const { name, href } = sibling(false);

				PaginationItem($$renderer, {
					href,
					class: 'hover:text-primary-700 dark:hover:text-primary-700 flex  items-center  gap-2.5',
					children: ($$renderer) => {
						ArrowLeft($$renderer, {});
						$$renderer.push(`<!----> ${$.escape(name)}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push(`<!--[-1--><div></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push(`<!--[0--><div class="hidden sm:block">`);
				children($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (index < components.length - 1) {
				$$renderer.push('<!--[0-->');

				const { name, href } = sibling(true);

				PaginationItem($$renderer, {
					href,
					class: 'hover:text-primary-700 dark: dark:hover:text-primary-700 flex items-center gap-2.5',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(name)} `);
						ArrowRight($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push(`<!--[-1--><div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (children) {
			$$renderer.push(`<!--[0--><div class="sm:hidden">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}