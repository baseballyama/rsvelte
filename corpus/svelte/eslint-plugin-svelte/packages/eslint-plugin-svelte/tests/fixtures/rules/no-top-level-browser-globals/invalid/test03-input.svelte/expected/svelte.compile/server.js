import * as $ from 'svelte/internal/server';

export default function Test03_input($$renderer) {
	const a = localStorage.getItem('myCat');

	console.log(a);
}