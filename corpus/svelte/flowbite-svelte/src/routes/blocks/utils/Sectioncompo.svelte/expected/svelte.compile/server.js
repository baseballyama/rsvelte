import * as $ from 'svelte/internal/server';
import { Button, Select } from "flowbite-svelte";
import CompoCard from "./CompoCard.svelte";
import Section from "./Section.svelte";
import { Search } from "flowbite-svelte";

export default function Sectioncompo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { header, data, section } = $$props;
		let searchTerm = "";
		let expanded = true;
		const INIT_COUNT = 18;

		const sectionPosts = $.derived(() => section !== undefined
			? data.posts.blocks[section]
			: Object.values(data.posts.blocks).flat());

		// $inspect('sectionPosts',sectionPosts)
		const searchTermLower = $.derived(() => searchTerm.toLowerCase());

		let blockSelected = "";

		let blockCategories = [
			{ value: "application", name: "Application UI" },
			{ value: "marketing", name: "Marketing UI" },
			{ value: "publisher", name: "Publisher UI" }
		];

		const filteredSectionPosts = $.derived(() => blockSelected
			? sectionPosts().filter((post) => post.meta?.dir === blockSelected)
			: sectionPosts());

		const components = $.derived(() => filteredSectionPosts().filter((post) => {
			if (!post.meta || !post.meta.breadcrumb_title) return false;

			const breadcrumbTitleLower = post.meta.breadcrumb_title.toLowerCase();
			const pathDoesNotIncludePage = post.path.indexOf("/+page") === -1;
			const breadcrumbTitleIncludesSearchTerm = breadcrumbTitleLower.includes(searchTermLower());

			return breadcrumbTitleIncludesSearchTerm && pathDoesNotIncludePage;
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Section($$renderer, {
				class: 'max-w-8xl mx-auto',
				children: ($$renderer) => {
					$$renderer.push(`<div class="mb-6 flex w-full">`);

					Search($$renderer, {
						size: 'md',
						placeholder: 'Search by name',
						clearable: true,
						class: 'mr-2 w-64',
						get value() {
							return searchTerm;
						},

						set value($$value) {
							searchTerm = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					if (section === undefined) {
						$$renderer.push('<!--[0-->');

						Select($$renderer, {
							id: 'blocks-select',
							class: 'w-48',
							placeholder: '',
							get value() {
								return blockSelected;
							},

							set value($$value) {
								blockSelected = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.option({ selected: true, value: '' }, ($$renderer) => {
									$$renderer.push(`All categories`);
								});

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(blockCategories);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let { value, name } = each_array[$$index];

									$$renderer.option({ value }, ($$renderer) => {
										$$renderer.push(`${$.escape(name)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (header) {
						$$renderer.push('<!--[0-->');
						header($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"><!--[-->`);

					const each_array_1 = $.ensure_array_like(components().slice(0, INIT_COUNT));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let { path, meta: { dir, breadcrumb_title } } = each_array_1[$$index_1];

						CompoCard($$renderer, { name: breadcrumb_title, dir: "blocks/" + dir, path });
					}

					$$renderer.push(`<!--]--> `);

					if (expanded) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array_2 = $.ensure_array_like(components().slice(INIT_COUNT));

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let { path, meta: { dir, breadcrumb_title } } = each_array_2[$$index_2];

							CompoCard($$renderer, { name: breadcrumb_title, dir: "blocks/" + dir, path });
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (!expanded && components().length > INIT_COUNT) {
						$$renderer.push(`<!--[0--><div class="mb-4 flex w-full justify-center">`);

						Button($$renderer, {
							size: 'md',
							class: 'hover:text-primary-600 focus:text-primary-600 whitespace-nowrap',
							color: 'alternative',
							onclick: () => expanded = true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->View all components`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}