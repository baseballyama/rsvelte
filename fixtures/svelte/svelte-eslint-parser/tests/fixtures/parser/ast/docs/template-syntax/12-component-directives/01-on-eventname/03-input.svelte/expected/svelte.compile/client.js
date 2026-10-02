import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _3_input($$anchor, $$props) {
	SomeComponent($$anchor, {
		$$events: {
			whatever: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});
}