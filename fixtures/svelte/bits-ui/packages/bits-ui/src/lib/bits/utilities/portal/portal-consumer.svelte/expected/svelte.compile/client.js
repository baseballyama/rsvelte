import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Portal_consumer($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => $$props.children, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}