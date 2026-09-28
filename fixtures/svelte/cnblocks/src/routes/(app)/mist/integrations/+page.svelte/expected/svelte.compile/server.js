import * as $ from 'svelte/internal/server';
import { all_mists_integrations } from "$lib/all_mists/integrations";
import MistBlockPreview from "$lib/components/web/MistBlockPreview.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

export default function _page($$renderer) {
	MetaTags($$renderer, $.spread_props([seoMetaTags, { title: 'Integrations' }]));
	$$renderer.push(`<!----> <!--[-->`);

	const each_array = $.ensure_array_like(all_mists_integrations);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let block = each_array[$$index];

		MistBlockPreview($$renderer, $.spread_props([block]));
	}

	$$renderer.push(`<!--]-->`);
}