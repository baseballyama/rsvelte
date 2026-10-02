import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	Button($$anchor, {
		$$events: {
			click: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});
}