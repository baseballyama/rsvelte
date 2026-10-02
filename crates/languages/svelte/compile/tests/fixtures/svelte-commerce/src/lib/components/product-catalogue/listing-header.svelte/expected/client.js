import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Select from '$lib/components/form/select.svelte';
import { sortOptions } from '$lib/config.js';
import { selectSort } from '$lib/core/utils/index.js';

var root = $.from_html(`<div class="ed-lh__sort hidden items-center gap-2 lg:flex"><span class="ed-lh__sortlabel text-[10px] font-bold uppercase tracking-widest text-gray-400 svelte-7ok2xa">Sort by</span> <!></div>`);
var root_1 = $.from_html(`<div class="ed-lh__desc mt-4 svelte-7ok2xa" style="white-space: pre-line"></div>`);
var root_2 = $.from_html(`<div class="ed-lh flex flex-wrap items-center justify-between gap-y-2 svelte-7ok2xa"><div class="ed-lh__group intra-gap flex items-center svelte-7ok2xa"><h1 class="page-heading ed-lh__title svelte-7ok2xa"><!></h1> <div class="flex flex-col"><span class="ed-lh__count text-sm tracking-widest text-gray-900 dark:text-gray-200 svelte-7ok2xa"> </span></div></div> <!> <!></div>`);

export default function Listing_header($$anchor, $$props) {
	$.push($$props, true);

	const data = $.derived(() => page.data);
	var div = root_2();
	var div_1 = $.child(div);
	var h1 = $.child(div_1);
	var node = $.child(h1);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, `Search Results: "${$0 ?? ''}"`), [() => page.url.searchParams.get('search')]);
			$.append($$anchor, text);
		};

		var d = $.derived(() => page.url.searchParams.get('search'));

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(data).products.categoryHierarchy[$.get(data).products.categoryHierarchy.length - 1].name));
			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var text_2 = $.text('All Products');

			$.append($$anchor, text_2);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else if ($.get(data).products?.categoryHierarchy?.length > 0) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(h1);

	var div_2 = $.sibling(h1, 2);
	var span = $.child(div_2);
	var text_3 = $.only_child(span);

	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_3 = root();
			var node_2 = $.sibling($.child(div_3), 2);

			Select(node_2, {
				class: '!mb-0 ed-lh__select',
				id: 'sort-by',
				get value() {
					return $$props.selectedSort;
				},

				get data() {
					return sortOptions;
				},
				optionSelected: (value) => selectSort(value)
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(data).products.data.length) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_4 = root_1();

			$.html(div_4, () => $.get(data)?.products?.category?.description, true);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_3, ($$render) => {
			if ($.get(data)?.products?.category?.description) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text_3, `${($.get(data).products.count > 999 ? '1000+' : $.get(data).products.count) ?? ''} Products`));
	$.append($$anchor, div);
	$.pop();
}