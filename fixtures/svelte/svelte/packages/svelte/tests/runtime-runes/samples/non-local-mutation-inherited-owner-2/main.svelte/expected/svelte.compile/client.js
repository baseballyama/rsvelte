import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';
import { create_my_state } from './state.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const myState = create_my_state();

	Sub($$anchor, {
		get count() {
			return myState.my_state;
		},

		get inc() {
			return myState.inc;
		}
	});

	$.pop();
}