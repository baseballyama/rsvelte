import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { computedStyles } from '@layerstack/svelte-actions/styles';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<div></div> <!>`, 1);

export default function ComputedStyles($$anchor, $$props) {
	$.push($$props, true);

	let styles = $.state($.proxy({}));
	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node, $$action_arg) => computedStyles?.($$node, $$action_arg), () => (_styles) => $.set(styles, _styles, true));

	var node = $.sibling(div, 2);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ styles: $.get(styles) }));
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cls('lc-computed-styles', $$props.class))]);
	$.append($$anchor, fragment);
	$.pop();
}