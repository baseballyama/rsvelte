import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div foo="bar"></div> <div foo="bar baz"></div>`);
}