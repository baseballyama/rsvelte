import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';
import { create_my_state } from './state.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myState = create_my_state();

		Sub($$renderer, { count: myState.my_state, inc: myState.inc });
	});
}