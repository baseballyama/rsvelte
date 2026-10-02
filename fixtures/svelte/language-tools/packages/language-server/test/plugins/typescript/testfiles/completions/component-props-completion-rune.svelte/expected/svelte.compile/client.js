import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentPropsRune from './component-props-rune.svelte';
import { ComponentDef5 } from './ComponentDef';

var root = $.from_html(`<!> <!>`, 1);

export default function Component_props_completion_rune($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ComponentPropsRune(node, {});

	var node_1 = $.sibling(node, 2);

	ComponentDef5(node_1, {});
	$.append($$anchor, fragment);
}