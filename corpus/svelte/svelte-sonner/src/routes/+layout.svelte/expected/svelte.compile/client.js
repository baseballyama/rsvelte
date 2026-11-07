import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './styles.css';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
}