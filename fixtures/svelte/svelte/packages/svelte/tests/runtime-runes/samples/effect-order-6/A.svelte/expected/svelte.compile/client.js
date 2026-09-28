import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import B from './B.svelte';

export default function A($$anchor, $$props) {
	$.push($$props, true);

	// this runs after the effect in B, because child effects run first
	$.user_effect(() => {
		console.log({ boolean: $$props.boolean, closed: $$props.closed });
	});

	B($$anchor, {
		get closed() {
			return $$props.closed;
		},

		get close() {
			return $$props.close;
		}
	});

	$.pop();
}