import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import CompoCard from "../utils/CompoCard.svelte";
import Section from "./utils/Section.svelte";

var root = $.from_html(`<div class="mb-4 flex w-full justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4 sm:gap-4"><h2 class="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl dark:text-white">Svelte UI components</h2> <p class="mx-auto max-w-3xl text-center text-lg font-normal text-gray-500 dark:text-gray-400">Explore the whole collection of <span class="font-medium text-gray-900 dark:text-white"> </span> UI components and interactive elements built with Svelte and Flowbite</p></div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3"><!> <!></div> <!>`, 1);

export default function Components($$anchor, $$props) {
	$.push($$props, true);

	let components = $.derived(() => [
		...$$props.data.posts.forms,
		...$$props.data.posts.components,
		...$$props.data.posts.typography
	].sort((a, b) => a.meta.component_title.localeCompare(b.meta.component_title)));

	const INIT_COUNT = 18;
	let expanded = $.state(false);

	Section($$anchor, {
		class: 'flex flex-col gap-8 sm:gap-12 lg:pt-24',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var p = $.sibling($.child(div), 2);
			var span = $.sibling($.child(p));
			var text = $.only_child(span);

			$.next();
			$.reset(p);
			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node = $.child(div_1);

			$.each(node, 17, () => $.get(components).slice(0, INIT_COUNT), ({ path, meta: { dir, component_title, thumbnailSize } }) => dir + path, ($$anchor, $$item) => {
				let path = () => $.get($$item).path;
				let dir = () => $.get($$item).meta.dir;
				let component_title = () => $.get($$item).meta.component_title;
				let thumbnailSize = () => $.get($$item).meta.thumbnailSize;

				CompoCard($$anchor, {
					get name() {
						return component_title();
					},

					get thumbnailSize() {
						return thumbnailSize();
					},

					get dir() {
						return dir();
					},

					get path() {
						return path();
					}
				});
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.each(node_2, 17, () => $.get(components).slice(INIT_COUNT), ({ path, meta: { dir, component_title, thumbnailSize } }) => dir + path, ($$anchor, $$item) => {
						let path = () => $.get($$item).path;
						let dir = () => $.get($$item).meta.dir;
						let component_title = () => $.get($$item).meta.component_title;
						let thumbnailSize = () => $.get($$item).meta.thumbnailSize;

						CompoCard($$anchor, {
							get name() {
								return component_title();
							},

							get thumbnailSize() {
								return thumbnailSize();
							},

							get dir() {
								return dir();
							},

							get path() {
								return path();
							}
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if ($.get(expanded)) $$render(consequent);
				});
			}

			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_2 = root();
					var node_4 = $.child(div_2);

					Button(node_4, {
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

				$.if(node_3, ($$render) => {
					if (!$.get(expanded)) $$render(consequent_1);
				});
			}

			$.template_effect(() => $.set_text(text, `over ${$.get(components).length ?? ''} open-source`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}