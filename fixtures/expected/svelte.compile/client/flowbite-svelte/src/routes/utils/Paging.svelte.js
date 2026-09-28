import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { PaginationItem } from "$lib";
import ArrowLeft from "./icons/ArrowLeft.svelte";
import ArrowRight from "./icons/ArrowRight.svelte";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-row justify-between gap-2.5 self-stretch"><!> <div class="hidden sm:block"><!></div> <!></div>`);
var root_4 = $.from_html(`<div class="flex flex-col items-start gap-4 py-4"><!> <div class="sm:hidden"><!></div></div>`);

export default function Paging($$anchor, $$props) {
	$.push($$props, true);

	// const identity = x => x;
	let children = $.prop($$props, 'children', 3, undefined);

	const { data, url, params: { slug } } = page;
	const components = Object.values(data.posts.posts).flat().filter((x) => x.meta && x.meta.dir === data.dir).map(({ path, meta }) => ({ path, name: meta.component_title }));
	const index = components.findIndex((x) => x.path === "/" + slug);

	function sibling(next) {
		const i = next ? index + 1 : index - 1,
			{ path, name } = components[i],
			href = "" + new URL(path.slice(1), url);

		return { href, name };
	}

	var div = root_4();
	var node = $.child(div);

	{
		var consequent_2 = ($$anchor) => {
			var div_1 = root_3();
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					const computed_const = $.derived(() => {
						return sibling(false);
					});

					PaginationItem($$anchor, {
						get href() {
							return $.get(computed_const).href;
						},
						class: 'hover:text-primary-700 dark:hover:text-primary-700 flex  items-center  gap-2.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							ArrowLeft(node_2, {});

							var text = $.sibling(node_2);

							$.template_effect(() => $.set_text(text, ` ${$.get(computed_const).name ?? ''}`));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var div_2 = root_1();

					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (index > 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var div_3 = $.sibling(node_1, 2);
			var node_3 = $.child(div_3);

			$.snippet(node_3, () => children() ?? $.noop);
			$.reset(div_3);

			var node_4 = $.sibling(div_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					const computed_const_1 = $.derived(() => {
						return sibling(true);
					});

					PaginationItem($$anchor, {
						get href() {
							return $.get(computed_const_1).href;
						},
						class: 'hover:text-primary-700 dark: dark:hover:text-primary-700 flex items-center gap-2.5',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root_2();
							var text_1 = $.first_child(fragment_3);
							var node_5 = $.sibling(text_1);

							ArrowRight(node_5, {});
							$.template_effect(() => $.set_text(text_1, `${$.get(computed_const_1).name ?? ''} `));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				var alternate_1 = ($$anchor) => {
					var div_4 = root_1();

					$.append($$anchor, div_4);
				};

				$.if(node_4, ($$render) => {
					if (index < components.length - 1) $$render(consequent_1); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (index >= 0) $$render(consequent_2);
		});
	}

	var div_5 = $.sibling(node, 2);
	var node_6 = $.child(div_5);

	$.snippet(node_6, () => children() ?? $.noop);
	$.reset(div_5);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}