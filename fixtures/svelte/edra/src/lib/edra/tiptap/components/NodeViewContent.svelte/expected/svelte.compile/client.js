import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function NodeViewContent($$anchor, $$props) {
	let as = $.prop($$props, 'as', 3, 'div');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => 'nvc', ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.element(node_1, as, false, ($$element, $$anchor) => {
			$.attribute_effect($$element, () => ({
				class: $$props.class,
				'data-node-view-content': '',
				style: 'white-space: pre-wrap'
			}));
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}