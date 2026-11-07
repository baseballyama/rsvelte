import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function MarkViewContent($$anchor, $$props) {
	let as = $.prop($$props, 'as', 3, 'span');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => 'mvc', ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.element(node_1, as, false, ($$element, $$anchor) => {
			$.attribute_effect($$element, () => ({
				class: $$props.class,
				'data-mark-view-content': '',
				style: 'white-space: inherit'
			}));
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}