import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<h1>Hello ${$.escape(process.env.TMP_VAR)}!</h1>`);
}