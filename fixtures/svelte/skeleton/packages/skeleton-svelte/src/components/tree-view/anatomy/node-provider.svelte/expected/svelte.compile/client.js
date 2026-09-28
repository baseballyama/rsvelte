import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeViewNodeContext } from '../modules/node-context.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Node_provider($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const children = $.derived(() => $$props.children),
		nodeProps = $.derived(() => $$props.value);

	TreeViewNodeContext.provide(() => $.get(nodeProps));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}