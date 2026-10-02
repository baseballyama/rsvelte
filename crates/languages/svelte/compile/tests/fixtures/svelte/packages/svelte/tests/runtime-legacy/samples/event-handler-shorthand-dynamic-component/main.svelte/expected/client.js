import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

export default function Main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Widget, ($$anchor, $$component) => {
		$$component($$anchor, {
			$$events: {
				foo: function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				}
			}
		});
	});

	$.append($$anchor, fragment);
}