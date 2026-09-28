import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Home } from '@lucide/svelte';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

var root = $.from_html(`<a href="/"><img class="h-10 object-contain"/></a>`);
var root_1 = $.from_html(`<a href="/" class="flex items-center space-x-2"><span class="font-bold"> </span></a>`);

var root_2 = $.from_html(`<a class="ed-nav-link relative text-sm font-bold uppercase tracking-widest text-gray-500 transition-all
					after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-gray-900 hover:after:w-full active:scale-95" style="font-family: var(--font-body);"> </a>`);

var root_3 = $.from_html(`<div class="ml-6 hidden items-center space-x-6 lg:flex"></div>`);
var root_4 = $.from_html(`<div class="mr-4 md:flex"><div class="flex gap-3"><!> <!></div></div>`);

export default function Main_nav($$anchor, $$props) {
	$.push($$props, true);

	var div = root_4();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var img = $.only_child(a);

			$.template_effect(
				($0) => {
					$.set_attribute(img, 'src', $0);
					$.set_attribute(img, 'alt', `${(page?.data?.store?.name || 'Store') ?? ''} logo`);
				},
				[() => getImageCDNUrl(page?.data?.store?.logo, 300, 0)]
			);

			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var a_1 = root_1();
			var span = $.child(a_1);
			var text = $.only_child(span, true);

			$.reset(a_1);
			$.template_effect(() => $.set_text(text, page?.data?.store?.name || ''));
			$.append($$anchor, a_1);
		};

		$.if(node, ($$render) => {
			if (page?.data?.store?.logo) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_3();

			$.each(div_2, 21, () => page?.data?.store?.menu?.find?.((menu) => menu?.menuId === 'header')?.items || [], $.index, ($$anchor, item) => {
				var a_2 = root_2();
				var text_1 = $.only_child(a_2, true);

				$.template_effect(() => {
					$.set_attribute(a_2, 'href', $.get(item).link);
					$.set_text(text_1, $.get(item)?.name);
				});

				$.append($$anchor, a_2);
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (!page?.data?.store?.plugins?.megamenu?.active) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}