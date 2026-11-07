import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useRename } from './rename.svelte.js';

export default function Rename_provider($$anchor, $$props) {
	$.push($$props, true);
	useRename();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}