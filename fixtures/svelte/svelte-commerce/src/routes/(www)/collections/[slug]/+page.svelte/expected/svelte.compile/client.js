import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

var root = $.from_html(`<p class="text-sm text-muted-foreground"> </p>`);
var root_1 = $.from_html(`<p class="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground"> </p>`);
var root_2 = $.from_html(`<div class="flex h-96 items-center justify-center"><p class="text-sm text-muted-foreground">No products in this collection yet.</p></div>`);
var root_3 = $.from_html(`<li><!></li>`);
var root_4 = $.from_html(`<ul class="grid grid-cols-2 gap-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"></ul>`);
var root_5 = $.from_html(`<!> <div class="container mx-auto mt-2 min-h-screen max-md:px-4"><div class="mb-6 flex flex-col items-start gap-2"><h1 class="text-2xl font-bold"> </h1> <!> <span class="text-sm text-muted-foreground"> </span></div> <!> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// This file was 0 bytes: the loader fetched the collection and the route answered 200 with an
	// empty document. Render what wwwCollectionsSlugLoad already returns ({ collection, allratings }).
	const collection = $.derived(() => page.data?.collection);

	const products = $.derived(() => ($.get(collection)?.collectionvalues || []).map((value) => value?.products).filter(Boolean));
	var fragment = root_5();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(collection)?.title || $.get(collection)?.name || 'Collection');
		let $1 = $.derived(() => $.get(collection)?.subTitle || $.get(collection)?.description);
		let $2 = $.derived(() => $.get(collection)?.img || $.get(collection)?.images?.[0]);

		SeoHeader(node, {
			get metaTitle() {
				return $.get($0);
			},

			get metaDescription() {
				return $.get($1);
			},

			get image() {
				return $.get($2);
			}
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var h1 = $.child(div_1);
	var text = $.only_child(h1, true);
	var node_1 = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(collection).subTitle));
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(collection)?.subTitle) $$render(consequent);
		});
	}

	var span = $.sibling(node_1, 2);
	var text_2 = $.only_child(span);

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_3 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_3, $.get(collection).description));
			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(collection)?.description) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var ul = root_4();

			$.each(ul, 21, () => $.get(products), $.index, ($$anchor, product, i) => {
				var li = root_3();
				var node_4 = $.child(li);

				ProductCard(node_4, {
					get product() {
						return $.get(product);
					},
					priority: i < 4
				});

				$.reset(li);
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.append($$anchor, ul);
		};

		$.if(node_3, ($$render) => {
			if (!$.get(products).length) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $.get(collection)?.title || $.get(collection)?.name);
		$.set_text(text_2, `${$.get(products).length ?? ''} ${$.get(products).length === 1 ? 'Product' : 'Products'}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}