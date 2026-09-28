import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem, Heading, P } from "flowbite-svelte";
import { HighlightCompo } from "svelte-rune-highlight";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const modules = import.meta.glob("./md/*.md", { query: "?raw", import: "default", eager: true });

		$$renderer.push(`<main class="h-screen w-full overflow-y-auto bg-white dark:bg-gray-900"><div class="p-12">`);

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
					children: ($$renderer) => {
						$$renderer.push(`<!---->About`);
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
			class: 'mb-8 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Flowbite Svelte Admin Dashboard`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h2',
			class: 'my-8 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Installation`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		HighlightCompo($$renderer, { class: 'mb-8', code: modules["./md/installation.md"] });
		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->If you use SvelteKit and the main css file is \`src/routes/layout.css\` or \`src/app.css\`, add one of the following based on the file location:`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		HighlightCompo($$renderer, { class: 'mb-8', code: modules["./md/css.md"] });
		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h2',
			class: 'my-8 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->.env File`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Create <code>.env</code> file and add your image url or directory to <code>VITE_IMG_DIR</code>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		HighlightCompo($$renderer, { class: 'mb-8', code: modules["./md/env.md"] });
		$$renderer.push(`<!----></div></main>`);
	});
}