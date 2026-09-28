import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SegmentedControlRootContext } from '../modules/root-context.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root_context($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const segmentedControl = SegmentedControlRootContext.consume();
	const children = $.derived(() => $$props.children);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children), () => segmentedControl);
	$.append($$anchor, fragment);
	$.pop();
}