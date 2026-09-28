import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main_client($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => '<p>Client</p> <span>has more nodes so if we would walk this because we think it is static we would get an error</span>');
	$.append($$anchor, fragment);
}