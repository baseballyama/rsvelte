import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	const a = window.localStorage.getItem('myCat');

	console.log(a);
}