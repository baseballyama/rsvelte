import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function whatever() {
		x: {
			console.log('am not reactive');
		}
	}

	whatever();
}