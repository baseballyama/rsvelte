import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Render01_input($$anchor, $$props) {
	function bar() {
		return "baz";
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(bar);

		$.snippet(node, () => $$props.foo, () => $.get($0));
	}

	$.append($$anchor, fragment);
}