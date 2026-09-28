import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = 'world';

	$$renderer.push(`<p>Hello world, what's up? this &amp; that</p> <p>Hello world, what's up? this &amp; that</p> <p>Hello world, what's up?<span></span> this &amp; that</p>`);
}