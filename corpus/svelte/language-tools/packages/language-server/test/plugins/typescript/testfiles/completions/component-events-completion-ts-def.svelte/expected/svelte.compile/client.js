import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComponentDef, ComponentDef2 } from './ComponentDef';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Component_events_completion_ts_def($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ComponentDef(node, { on: true });

	var node_1 = $.sibling(node, 2);

	ComponentDef(node_1, { let: true });

	var node_2 = $.sibling(node_1, 2);

	ComponentDef2(node_2, { on: true });
	$.append($$anchor, fragment);
}