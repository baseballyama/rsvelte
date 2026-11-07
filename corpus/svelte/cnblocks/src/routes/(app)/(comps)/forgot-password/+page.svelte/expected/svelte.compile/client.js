import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { forgot_password } from "$lib/all_blocks/forgot-password";
import BlockPreview from "$lib/components/web/BlockPreview.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTags(node, $.spread_props(() => seoMetaTags, { title: 'Forgot Password' }));

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => forgot_password, $.index, ($$anchor, block) => {
		BlockPreview($$anchor, $.spread_props(() => $.get(block)));
	});

	$.append($$anchor, fragment);
}