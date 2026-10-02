import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Loading from "carbon-components-svelte/Loading/Loading.svelte";

var root = $.from_html(`<div data-testid="default-loader"><!></div> <div data-testid="loader-no-overlay"><!></div> <div data-testid="loader-small"><!></div> <div data-testid="loader-inactive"><!></div> <div data-testid="loader-description"><!></div>`, 1);

export default function Loading_test($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Loading(node, {});
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Loading(node_1, { withOverlay: false });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Loading(node_2, { withOverlay: false, small: true });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	Loading(node_3, { active: false });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	Loading(node_4, { description: 'Processing data...' });
	$.reset(div_4);
	$.append($$anchor, fragment);
}