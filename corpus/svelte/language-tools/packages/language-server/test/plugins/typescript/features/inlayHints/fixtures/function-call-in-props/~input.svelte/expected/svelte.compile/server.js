import * as $ from 'svelte/internal/server';
import { SvelteComponentTyped } from 'svelte';

export default function Input($$renderer) {
	let Component;

	function hi(name) {}

	Component($$renderer, { text: hi('') });
}