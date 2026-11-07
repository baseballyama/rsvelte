import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { ChevronRight, Home } from '@lucide/svelte';

var root = $.from_html(`<a class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white md:ml-2"> </a>`);
var root_1 = $.from_html(`<span class="truncate text-gray-600 dark:text-gray-300 md:ml-2"> </span>`);
var root_2 = $.from_html(`<li><div class="flex w-max items-center"><!> <div class="grid grid-cols-1"><!></div></div></li>`);
var root_3 = $.from_html(`<li><div class="flex items-center"><!> <span class="ml-1 text-gray-600 dark:text-gray-300 md:ml-2">...</span> <!></div></li>`);
var root_4 = $.from_html(`<nav class="flex overflow-hidden truncate" aria-label="Breadcrumb"><div class="inline-flex items-center space-x-1 text-sm md:space-x-2"><div class="inline-flex items-center"><a href="/" class="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><!> Home</a></div> <ol class="hidden sm:inline-flex md:items-center md:space-x-2"></ol> <ol class="flex sm:hidden"><!> <li><div class="grid grid-cols-1"><a class="ml-1 truncate text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white md:ml-2"> </a></div></li></ol></div></nav>`);

export default function Breadcrumb_route($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));
	let isProductsPage = $.derived(() => page.route?.id === '/(www)/products/[slug]');

	$.user_effect(() => {
		if ($$props.items) {
			$.set(items, $$props.items, true);

			return;
		}

		let paths = decodeURIComponent(page.url?.pathname || '')?.split?.('/')?.filter?.(Boolean)?.map?.((p) => {
			return { name: p, isCategory: false };
		});

		let categories = [];

		if ($.get(isProductsPage) && paths?.length > 0 && $$props.product?.categories?.length) {
			paths = paths?.filter((p) => p.name !== 'products');

			categories = $$props.product?.categories?.[0]?.category
				? [
					{
						name: $$props.product.categories[0].category.name,
						id: $$props.product.categories[0].category.id,
						isCategory: true,
						href: `${$$props.product.categories[0].category.slug || $$props.product.categories[0].category.name}`
					}
				]
				: [];

			if (categories?.length) {
				const uniqueCategories = categories?.reduce(
					(acc, current) => {
						const x = acc?.find((item) => item?.id === current?.id);

						if (!x) {
							return acc?.concat([current]);
						} else {
							return acc;
						}
					},
					[]
				);

				paths = [...uniqueCategories, ...paths];
			}
		}

		$.set(
			items,
			paths.map((path, index) => {
				let href = '';

				// if (path?.isCategory) {
				href = `/${path?.link || path?.slug || path?.name}`;

				// } else {
				// 	href =
				// 		'/' +
				// 		paths
				// 			?.map((p) => p?.name)
				// 			?.slice(0, index + 1)
				// 			.join('/')
				// }
				const titleCaseLabel = path?.name?.toLowerCase()?.replace(/-/g, ' ')?.// Remove hyphens and replace with spaces
				replace(/\b\w/g, (char) => char?.toUpperCase()); // Convert to title case

				return { label: titleCaseLabel, href };
			}),
			true
		);
	});

	var nav = root_4();
	var div = $.child(nav);
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node = $.child(a);

	Home(node, { class: 'mr-2 h-4 w-4' });
	$.next();
	$.reset(a);
	$.reset(div_1);

	var ol = $.sibling(div_1, 2);

	$.each(ol, 21, () => $.get(items), $.index, ($$anchor, $$item, i) => {
		let label = () => $.get($$item).label;
		let href = () => $.get($$item).href;
		var li = root_2();
		var div_2 = $.child(li);
		var node_1 = $.child(div_2);

		ChevronRight(node_1, { class: 'h-4 min-h-4 w-4 min-w-4 text-gray-400' });

		var div_3 = $.sibling(node_1, 2);
		var node_2 = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				var a_1 = root();
				var text = $.only_child(a_1, true);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', href());
					$.set_text(text, label());
				});

				$.append($$anchor, a_1);
			};

			var alternate = ($$anchor) => {
				var span = root_1();
				var text_1 = $.only_child(span, true);

				$.template_effect(() => $.set_text(text_1, label()));
				$.append($$anchor, span);
			};

			$.if(node_2, ($$render) => {
				if (href() && i < $.get(items).length - 1) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_3);
		$.reset(div_2);
		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ol);

	var ol_1 = $.sibling(ol, 2);
	var node_3 = $.child(ol_1);

	{
		var consequent_1 = ($$anchor) => {
			var li_1 = root_3();
			var div_4 = $.child(li_1);
			var node_4 = $.child(div_4);

			ChevronRight(node_4, { class: 'h-4 w-4 text-gray-400' });

			var node_5 = $.sibling(node_4, 4);

			ChevronRight(node_5, { class: 'h-4 w-4 text-gray-400' });
			$.reset(div_4);
			$.reset(li_1);
			$.append($$anchor, li_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(items)?.length > 1) $$render(consequent_1);
		});
	}

	var li_2 = $.sibling(node_3, 2);
	var div_5 = $.child(li_2);
	var a_2 = $.child(div_5);
	var text_2 = $.only_child(a_2, true);

	$.reset(div_5);
	$.reset(li_2);
	$.reset(ol_1);
	$.reset(div);
	$.reset(nav);

	$.template_effect(() => {
		$.set_attribute(a_2, 'href', $.get(items)?.[$.get(items)?.length - 1]?.href);
		$.set_text(text_2, $.get(items)?.[$.get(items)?.length - 1]?.label);
	});

	$.append($$anchor, nav);
	$.pop();
}