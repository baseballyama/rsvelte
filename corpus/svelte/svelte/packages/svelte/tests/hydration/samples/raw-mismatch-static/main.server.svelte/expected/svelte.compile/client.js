import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main_server($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => 'Server');
	$.append($$anchor, fragment);
}