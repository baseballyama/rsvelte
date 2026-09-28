import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTooltip } from '../modules/provider.svelte';
import { TooltipRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/tooltip';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => splitProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		tooltipProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const children = $.derived(() => $.get(componentProps).children);
	const tooltip = useTooltip(() => ({ ...$.get(tooltipProps), id }));

	TooltipRootContext.provide(() => tooltip());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}