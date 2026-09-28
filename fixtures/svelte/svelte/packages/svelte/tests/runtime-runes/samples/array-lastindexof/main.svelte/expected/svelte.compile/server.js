import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const arr = [0, 1, 2];

	console.log(arr.lastIndexOf(2));
	console.log(arr.lastIndexOf(2, arr.length - 1));
}