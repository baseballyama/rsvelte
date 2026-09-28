import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	const arr = [0, 1, 2];

	console.log(arr.lastIndexOf(2));
	console.log(arr.lastIndexOf(2, arr.length - 1));
}