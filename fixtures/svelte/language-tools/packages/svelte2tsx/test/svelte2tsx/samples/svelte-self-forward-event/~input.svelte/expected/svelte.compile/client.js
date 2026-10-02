import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from "svelte";

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let a = [''];
	const dispatch = createEventDispatcher();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => a, $.index, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		Input(node_1, {
			$$events: {
				foo: function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				}
			}
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}