import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Canonical from '$lib/components/seo/canonical.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';
import { ChevronRight } from '@lucide/svelte';

var root = $.from_html(`<img loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>`);
var root_1 = $.from_html(`<div class="text-xs text-gray-600"> </div>`);
var root_2 = $.from_html(`<div class="flex items-center gap-0.5 text-xs text-primary"><span>View All</span> <!></div>`);
var root_3 = $.from_html(`<a class="group flex flex-col overflow-hidden rounded-lg border bg-white transition-all hover:border-primary hover:shadow-lg"><div class="relative aspect-square overflow-hidden bg-muted"><!></div> <div class="flex flex-1 flex-col p-3"><h3 class="font-medium"> </h3> <div class="mt-1 space-y-0.5"><!> <!></div></div></a>`);
var root_4 = $.from_html(`<div class="container max-w-6xl px-4 py-4 md:py-10"><h1 class="mb-6 text-xl font-medium md:text-2xl">Shop by Category</h1> <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"></div></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_4();

	$.head('rsplks', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Categories';
		});
	});

	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => $$props.data.categories, $.index, ($$anchor, category) => {
		var a = root_3();
		var div_2 = $.child(a);
		var node = $.child(div_2);

		{
			var consequent = ($$anchor) => {
				var img = root();

				$.template_effect(() => {
					$.set_attribute(img, 'src', $.get(category).img);
					$.set_attribute(img, 'alt', $.get(category).name);
				});

				$.append($$anchor, img);
			};

			var alternate = ($$anchor) => {
				EmptyImage($$anchor, { class: 'h-full w-full' });
			};

			$.if(node, ($$render) => {
				if ($.get(category).img) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);
		var h3 = $.child(div_3);
		var text = $.only_child(h3, true);
		var div_4 = $.sibling(h3, 2);
		var node_1 = $.child(div_4);

		$.each(node_1, 17, () => $.get(category).children.slice(0, 2), $.index, ($$anchor, child) => {
			var div_5 = root_1();
			var text_1 = $.only_child(div_5, true);

			$.template_effect(() => $.set_text(text_1, $.get(child).name));
			$.append($$anchor, div_5);
		});

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_6 = root_2();
				var node_3 = $.sibling($.child(div_6), 2);

				ChevronRight(node_3, { class: 'h-3 w-3' });
				$.reset(div_6);
				$.append($$anchor, div_6);
			};

			$.if(node_2, ($$render) => {
				if ($.get(category).children.length > 2) $$render(consequent_1);
			});
		}

		$.reset(div_4);
		$.reset(div_3);
		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `/${$.get(category).slug ?? ''}`);
			$.set_text(text, $.get(category).name);
		});

		$.append($$anchor, a);
	});

	$.reset(div_1);
	$.reset(div);

	var node_4 = $.sibling(div, 2);

	Canonical(node_4, {});
	$.append($$anchor, fragment);
	$.pop();
}