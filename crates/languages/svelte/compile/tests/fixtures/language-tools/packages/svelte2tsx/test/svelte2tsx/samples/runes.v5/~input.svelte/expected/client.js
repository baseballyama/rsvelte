import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	/** @type {{a: number, b: string}} */
	let x = 0;

	let y = $.derived(() => x * 2);
}