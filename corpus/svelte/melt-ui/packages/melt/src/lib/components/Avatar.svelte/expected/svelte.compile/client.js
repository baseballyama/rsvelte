import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getters } from "$lib/utils/getters.svelte.js";
import { Avatar as Builder } from "../builders/Avatar.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'onLoadingStatusChange'
]);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const avatar = new Builder(getters({ ...rest }));
	var $$exports = { avatar };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => avatar);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}