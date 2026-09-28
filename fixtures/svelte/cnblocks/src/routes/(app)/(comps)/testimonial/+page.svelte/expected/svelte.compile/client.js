import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { testimonials } from "$lib/all_blocks/testimonial";
import BlockPreview from "$lib/components/web/BlockPreview.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

var root = $.from_html(`<!> <section><div class="h-6 w-full bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] opacity-35"></div></section> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTags(node, $.spread_props(() => seoMetaTags, { title: 'Testiomonial' }));

	var node_1 = $.sibling(node, 4);

	$.each(node_1, 17, () => testimonials, $.index, ($$anchor, block) => {
		BlockPreview($$anchor, $.spread_props(() => $.get(block)));
	});

	$.append($$anchor, fragment);
}