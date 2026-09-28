import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div><button>main</button></div>`);
}