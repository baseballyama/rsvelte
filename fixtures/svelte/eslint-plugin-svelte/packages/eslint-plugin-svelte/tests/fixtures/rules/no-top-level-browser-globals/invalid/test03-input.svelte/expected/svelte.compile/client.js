import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test03_input($$anchor) {
	const a = localStorage.getItem('myCat');

	console.log(a);
}