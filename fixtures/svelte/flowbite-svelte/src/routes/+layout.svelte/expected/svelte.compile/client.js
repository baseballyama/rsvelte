import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../app.css";
import FathomAnalytics from "./utils/FathomAnalytics.svelte";
import CarbonAds from "./utils/CarbonAds.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	FathomAnalytics(node, {
		get FATHOM_ID() {
			return $$props.data.FATHOM_ID;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children);

	var node_2 = $.sibling(node_1, 2);

	CarbonAds(node_2, {});
	$.append($$anchor, fragment);
	$.pop();
}