import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.test ?? $.noop);
	$.append($$anchor, fragment);
}