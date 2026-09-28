import * as $ from 'svelte/internal/server';
import Parent from './Parent.svelte';

export default function Main($$renderer) {
	let test = { test: '' };

	Parent($$renderer, { test });
}