import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createThrelteContext } from '../../context/createThrelteContext.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function Context($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	createThrelteContext(() => rest);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}