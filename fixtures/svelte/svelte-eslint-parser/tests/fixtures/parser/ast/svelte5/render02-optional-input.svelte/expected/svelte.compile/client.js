import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Render02_optional_input($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.foo ?? $.noop);
	$.append($$anchor, fragment);
}