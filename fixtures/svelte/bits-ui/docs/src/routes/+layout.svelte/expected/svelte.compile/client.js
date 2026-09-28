import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster } from "svelte-sonner";
import { ModeWatcher } from "mode-watcher";
import Metadata from "$lib/components/metadata.svelte";
import "$lib/styles/app.css";
import { useSiteConfig } from "$lib/utils/use-site-config.svelte.js";
import { siteConfig } from "$lib/config/site.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	useSiteConfig(() => siteConfig);

	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var node_1 = $.sibling(node, 2);

	Metadata(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Toaster(node_2, { position: 'top-right' });

	var node_3 = $.sibling(node_2, 2);

	$.snippet(node_3, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}