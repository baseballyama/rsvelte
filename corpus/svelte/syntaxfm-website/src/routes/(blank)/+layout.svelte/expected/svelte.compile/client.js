import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../(site)/style.css';
import 'media-chrome';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
}