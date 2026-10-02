import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Foo($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}