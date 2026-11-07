import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import Blocks from '$lib/components/page-blocks/blocks.svelte';

var root = $.from_html(`<!> <section class="mt-20"><div class="container mx-auto flex max-w-7xl flex-col px-4 md:px-10"><div class="mx-auto flex max-w-max flex-col items-center py-5 text-center text-3xl font-bold sm:items-start sm:py-10 sm:text-4xl"><h1>About Us</h1> <hr class="mt-2.5 w-20 border-t-4 border-zinc-900 opacity-50"/></div> <div class="prose-lg prose-p:my-0 prose-li:my-0"></div></div></section> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $$props.data?.page?.metaTitle || 'About Us');

		SeoHeader(node, {
			get metaTitle() {
				return $.get($0);
			}
		});
	}

	var section = $.sibling(node, 2);
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.html(div_1, () => $$props.data?.page?.content, true);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);

	var node_1 = $.sibling(section, 2);

	{
		let $0 = $.derived(() => $$props.data?.page?.layouts);

		Blocks(node_1, {
			get layouts() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}