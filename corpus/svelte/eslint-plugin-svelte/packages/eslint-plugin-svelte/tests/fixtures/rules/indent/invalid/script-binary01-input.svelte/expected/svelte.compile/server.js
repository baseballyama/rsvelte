import * as $ from 'svelte/internal/server';

export default function Script_binary01_input($$renderer) {
	a = b;
	a = b = c;
	a + b + c;
	a + b;
	a = b || c - d + e;
	({ a = 1 + 2 + 3 } = v);
}