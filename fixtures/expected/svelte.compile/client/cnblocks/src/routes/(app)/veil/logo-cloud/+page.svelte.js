import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { all_veils_logo_cloud } from "$lib/all_veils/logo-cloud";
import MistBlockPreview from "$lib/components/web/MistBlockPreview.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTags(node, $.spread_props(() => seoMetaTags, { title: 'Logo Cloud' }));

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => all_veils_logo_cloud, $.index, ($$anchor, block) => {
		MistBlockPreview($$anchor, $.spread_props(() => $.get(block)));
	});

	$.append($$anchor, fragment);
}