import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

var root = $.from_html(`<section class="min-h-screen"><div class="container mx-auto flex max-w-7xl flex-col px-4 md:px-10"><div class="mx-auto flex max-w-max flex-col items-center py-5 text-center text-3xl font-bold sm:items-start sm:py-10 sm:text-4xl"><h1> </h1> <hr class="mt-2.5 w-20 border-t-4 border-zinc-900 opacity-50"/></div> <div class="prose-lg prose-p:my-0 prose-li:my-0"></div></div></section>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let seoProps = {
		metaTitle: `${$$props.data.page.metaTitle || $$props.data.page.name || ''}`,
		metaDescription: `${$$props.data.page.metaDescription || $$props.data.page.name || ''}`,
		metaKeywords: `${$$props.data.page.metaKeywords || $$props.data.page.name || ''}`
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	SeoHeader(node, $.spread_props(() => seoProps));

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var section = root();
			var div = $.child(section);
			var div_1 = $.child(div);
			var h1 = $.child(div_1);
			var text = $.only_child(h1, true);

			$.next(2);
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);

			$.html(div_2, () => $$props.data?.page?.content, true);
			$.reset(div_2);
			$.reset(div);
			$.reset(section);
			$.template_effect(() => $.set_text(text, $$props.data.page.name));
			$.append($$anchor, section);
		};

		$.if(node_1, ($$render) => {
			if ($$props.data?.page) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}