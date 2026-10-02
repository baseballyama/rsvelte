import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _1_input($$anchor) {
	let count = 0;

	function handleClick() {
		// calling this function will trigger an
		// update if the markup references `count`
		count = count + 1;
	}
}