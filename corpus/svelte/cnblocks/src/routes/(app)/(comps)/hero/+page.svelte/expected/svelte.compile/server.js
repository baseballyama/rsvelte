import * as $ from 'svelte/internal/server';
import { hero } from "$lib/all_blocks/hero";
import BlockPreview from "$lib/components/web/BlockPreview.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

export default function _page($$renderer) {
	MetaTags($$renderer, $.spread_props([seoMetaTags, { title: 'Hero' }]));
	$$renderer.push(`<!----> <!--[-->`);

	const each_array = $.ensure_array_like(hero);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let block = each_array[$$index];

		BlockPreview($$renderer, $.spread_props([block]));
	}

	$$renderer.push(`<!--]-->`);
}