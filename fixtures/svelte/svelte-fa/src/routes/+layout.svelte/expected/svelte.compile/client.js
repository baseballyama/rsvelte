import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../styles.scss";

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}