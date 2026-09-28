import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { siteConfig } from "$lib/site-config";
import "../app.css";
import { useSiteConfig } from "@svecodocs/kit";

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	useSiteConfig(() => siteConfig);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}