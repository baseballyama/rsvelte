import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer) {
	let count = 0;

	function handleClick() {
		// calling this function will trigger an
		// update if the markup references `count`
		count = count + 1;
	}
}