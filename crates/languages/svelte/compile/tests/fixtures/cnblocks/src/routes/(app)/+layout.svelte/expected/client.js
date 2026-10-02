import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import Header from "$lib/web/layouts/Header.svelte";
import SiteFooter from "$lib/web/layouts/SiteFooter.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// If Path include v2-docs, then don't shwo site footer
	let showHeaderFooter = $.derived(() => {
		let path = page.url.pathname;

		return !path.includes("v2-docs");
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children);

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			SiteFooter($$anchor, {});
		};

		$.if(node_2, ($$render) => {
			if ($.get(showHeaderFooter)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}