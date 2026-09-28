import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import { ChevronDown, ChevronUp } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';

var root = $.from_html(`<div class="grid grid-cols-1 overflow-x-auto pb-6"><div class="edp-prose prose prose-sm max-w-none leading-relaxed text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:list-disc [&amp;>table]:w-full [&amp;>table]:border-collapse [&amp;_td]:border-b [&amp;_td]:border-gray-50 [&amp;_td]:py-3 [&amp;_td]:text-sm [&amp;_th]:border-b [&amp;_th]:border-gray-100 [&amp;_th]:py-3 [&amp;_th]:text-left [&amp;_th]:text-xs [&amp;_th]:font-bold [&amp;_th]:uppercase [&amp;_th]:tracking-widest"></div></div>`);
var root_1 = $.from_html(`<div class="border-b border-gray-300 edp-acc"><button class="intra-pt flex w-full items-center justify-between gap-2 pb-2 text-base font-bold text-gray-900 edp-acc-btn"><span class="edp-acc-label">Product Description</span> <!></button> <!></div>`);

export default function Product_description($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	const data = $.derived(() => page.data);
	const description = $.derived(() => productState.selectedVariant?.description || $.get(data)?.product?.description || '');
	const hasDescription = $.derived(() => $.get(description).replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim().length > 0);
	let isOpen = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();
			var button = $.child(div);
			var node_1 = $.sibling($.child(button), 2);

			{
				var consequent = ($$anchor) => {
					ChevronUp($$anchor, { class: 'h-4 w-4 text-gray-800' });
				};

				var alternate = ($$anchor) => {
					ChevronDown($$anchor, { class: 'h-4 w-4 text-gray-800' });
				};

				$.if(node_1, ($$render) => {
					if ($.get(isOpen)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(button);

			var node_2 = $.sibling(button, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_1 = root();
					var div_2 = $.child(div_1);

					$.html(div_2, () => $.get(description), true);
					$.reset(div_2);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(isOpen)) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.delegated('click', button, () => $.set(isOpen, !$.get(isOpen)));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(hasDescription)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);