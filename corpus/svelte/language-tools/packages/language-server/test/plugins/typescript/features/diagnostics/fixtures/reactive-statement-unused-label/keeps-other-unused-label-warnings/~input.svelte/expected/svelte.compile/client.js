import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	function whatever() {
		x: {
			console.log('am not reactive');
		}
	}

	whatever();
}