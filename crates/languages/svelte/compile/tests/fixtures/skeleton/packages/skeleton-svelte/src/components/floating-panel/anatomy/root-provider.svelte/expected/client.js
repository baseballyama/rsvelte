import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingPanelRootContext } from '../modules/root-context.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root_provider($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const children = $.derived(() => $$props.children),
		floatingPanel = $.derived(() => $$props.value);

	FloatingPanelRootContext.provide(() => $.get(floatingPanel)());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}