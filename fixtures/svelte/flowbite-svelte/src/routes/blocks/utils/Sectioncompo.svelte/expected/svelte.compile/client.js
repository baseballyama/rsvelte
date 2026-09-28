import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Select } from "flowbite-svelte";
import CompoCard from "./CompoCard.svelte";
import Section from "./Section.svelte";
import { Search } from "flowbite-svelte";

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<option selected="">All categories</option> <!>`, 1);
var root_2 = $.from_html(`<div class="mb-4 flex w-full justify-center"><!></div>`);
var root_3 = $.from_html(`<div class="mb-6 flex w-full"><!> <!></div> <!> <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"><!> <!></div> <!>`, 1);

export default function Sectioncompo($$anchor, $$props) {
	$.push($$props, true);

	let searchTerm = $.state("");
	let expanded = $.state(true);
	const INIT_COUNT = 18;

	const sectionPosts = $.derived(() => $$props.section !== undefined
		? $$props.data.posts.blocks[$$props.section]
		: Object.values($$props.data.posts.blocks).flat());

	// $inspect('sectionPosts',sectionPosts)
	const searchTermLower = $.derived(() => $.get(searchTerm).toLowerCase());

	let blockSelected = $.state("");

	let blockCategories = [
		{ value: "application", name: "Application UI" },
		{ value: "marketing", name: "Marketing UI" },
		{ value: "publisher", name: "Publisher UI" }
	];

	const filteredSectionPosts = $.derived(() => $.get(blockSelected)
		? $.get(sectionPosts).filter((post) => post.meta?.dir === $.get(blockSelected))
		: $.get(sectionPosts));

	const components = $.derived(() => $.get(filteredSectionPosts).filter((post) => {
		if (!post.meta || !post.meta.breadcrumb_title) return false;

		const breadcrumbTitleLower = post.meta.breadcrumb_title.toLowerCase();
		const pathDoesNotIncludePage = post.path.indexOf("/+page") === -1;
		const breadcrumbTitleIncludesSearchTerm = breadcrumbTitleLower.includes($.get(searchTermLower));

		return breadcrumbTitleIncludesSearchTerm && pathDoesNotIncludePage;
	}));

	Section($$anchor, {
		class: 'max-w-8xl mx-auto',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Search(node, {
				size: 'md',
				placeholder: 'Search by name',
				clearable: true,
				class: 'mr-2 w-64',
				get value() {
					return $.get(searchTerm);
				},

				set value($$value) {
					$.set(searchTerm, $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					Select($$anchor, {
						id: 'blocks-select',
						class: 'w-48',
						placeholder: '',
						get value() {
							return $.get(blockSelected);
						},

						set value($$value) {
							$.set(blockSelected, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var option = $.first_child(fragment_3);

							option.value = option.__value = '';

							var node_2 = $.sibling(option, 2);

							$.each(node_2, 17, () => blockCategories, $.index, ($$anchor, $$item) => {
								let value = () => $.get($$item).value;
								let name = () => $.get($$item).name;
								var option_1 = root();
								var text = $.only_child(option_1, true);
								var option_1_value = {};

								$.template_effect(() => {
									$.set_text(text, name());

									if (option_1_value !== (option_1_value = value())) {
										option_1.value = (option_1.__value = option_1_value) ?? '';
									}
								});

								$.append($$anchor, option_1);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_1, ($$render) => {
					if ($$props.section === undefined) $$render(consequent);
				});
			}

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					$.snippet(node_4, () => $$props.header);
					$.append($$anchor, fragment_4);
				};

				$.if(node_3, ($$render) => {
					if ($$props.header) $$render(consequent_1);
				});
			}

			var div_1 = $.sibling(node_3, 2);
			var node_5 = $.child(div_1);

			$.each(node_5, 17, () => $.get(components).slice(0, INIT_COUNT), ({ path, meta: { dir, breadcrumb_title } }) => dir + path, ($$anchor, $$item) => {
				let path = () => $.get($$item).path;
				let dir = () => $.get($$item).meta.dir;
				let breadcrumb_title = () => $.get($$item).meta.breadcrumb_title;

				{
					let $0 = $.derived(() => "blocks/" + dir());

					CompoCard($$anchor, {
						get name() {
							return breadcrumb_title();
						},

						get dir() {
							return $.get($0);
						},

						get path() {
							return path();
						}
					});
				}
			});

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_6 = $.comment();
					var node_7 = $.first_child(fragment_6);

					$.each(node_7, 17, () => $.get(components).slice(INIT_COUNT), ({ path, meta: { dir, breadcrumb_title } }) => dir + path, ($$anchor, $$item) => {
						let path = () => $.get($$item).path;
						let dir = () => $.get($$item).meta.dir;
						let breadcrumb_title = () => $.get($$item).meta.breadcrumb_title;

						{
							let $0 = $.derived(() => "blocks/" + dir());

							CompoCard($$anchor, {
								get name() {
									return breadcrumb_title();
								},

								get dir() {
									return $.get($0);
								},

								get path() {
									return path();
								}
							});
						}
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node_6, ($$render) => {
					if ($.get(expanded)) $$render(consequent_2);
				});
			}

			$.reset(div_1);

			var node_8 = $.sibling(div_1, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_2 = root_2();
					var node_9 = $.child(div_2);

					Button(node_9, {
						size: 'md',
						class: 'hover:text-primary-600 focus:text-primary-600 whitespace-nowrap',
						color: 'alternative',
						onclick: () => $.set(expanded, true),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('View all components');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_8, ($$render) => {
					if (!$.get(expanded) && $.get(components).length > INIT_COUNT) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}