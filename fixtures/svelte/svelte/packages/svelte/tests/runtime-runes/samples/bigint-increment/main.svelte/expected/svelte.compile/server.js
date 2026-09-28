import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	for (let i = 0n; i <= 5n; i++) {
		console.log(i);
	}
}