import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 42;

	function shadow(output = value) {
		const value = 1337;

		return output;
	}

	console.log(shadow());
	value += 1;
	console.log(shadow());
}