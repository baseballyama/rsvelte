import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

export default function Main($$anchor, $$props) {
	Widget($$anchor, {
		$$events: {
			foo: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});
}