import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePopover } from '../modules/provider.svelte';
import { PopoverRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/popover';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => splitProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		popoverProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const children = $.derived(() => $.get(componentProps).children);
	const popover = usePopover(() => ({ ...$.get(popoverProps), id }));

	PopoverRootContext.provide(() => popover());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}