import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => $$props.html);
	$.append($$anchor, fragment);
}