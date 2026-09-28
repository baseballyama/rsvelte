import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeViewNodeContext } from '../modules/node-context.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Node_context($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const nodeProps = TreeViewNodeContext.consume();
	const children = $.derived(() => $$props.children);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children), () => nodeProps);
	$.append($$anchor, fragment);
	$.pop();
}