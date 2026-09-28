import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDialog } from '../modules/provider.svelte';
import { DialogRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/dialog';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => splitProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		dialogProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const children = $.derived(() => $.get(componentProps).children);
	const dialog = useDialog(() => ({ ...$.get(dialogProps), id }));

	DialogRootContext.provide(() => dialog());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}