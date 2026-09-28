import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useActions } from '@smui/common/internal';

var root = $.from_html(`<div class="target svelte-7r5djw"><span style="user-select: none;"><!></span></div>`);

export default function _UseActionsComponent($$anchor, $$props) {
	let use = $.prop($$props, 'use', 19, () => []);
	var div = root();
	var span = $.child(div);
	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);
}