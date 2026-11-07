import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_input($$anchor) {
	const a = window.localStorage.getItem('myCat');

	console.log(a);
}