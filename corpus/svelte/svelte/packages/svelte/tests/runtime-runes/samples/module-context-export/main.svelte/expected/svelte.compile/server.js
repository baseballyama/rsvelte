import * as $ from 'svelte/internal/server';

export const answer = 42;

export default function Main($$renderer) {
	$$renderer.push(`<p>42</p>`);
}