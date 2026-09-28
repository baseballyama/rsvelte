import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BadgeIndicator from "carbon-components-svelte/BadgeIndicator/BadgeIndicator.svelte";

var root = $.from_html(`<div data-testid="dot"><!></div> <div data-testid="zero"><!></div> <div data-testid="count"><!></div> <div data-testid="overflow"><!></div> <div data-testid="boundary"><!></div> <div data-testid="label"><!></div> <div data-testid="restprops"><!></div>`, 1);

export default function BadgeIndicator_test($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	BadgeIndicator(node, {});
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	BadgeIndicator(node_1, { count: 0 });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	BadgeIndicator(node_2, { count: 4 });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	BadgeIndicator(node_3, { count: 1000 });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	BadgeIndicator(node_4, { count: 999 });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	BadgeIndicator(node_5, { count: '1.2k' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_6 = $.child(div_6);

	BadgeIndicator(node_6, { id: 'notifications', class: 'custom' });
	$.reset(div_6);
	$.append($$anchor, fragment);
}