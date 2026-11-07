import * as $ from 'svelte/internal/server';
import { intersect } from '@svelte-put/intersect';

export default function Initialization_options($$renderer) {
	let root;

	$$renderer.push(`<main><section></section></main>`);
}