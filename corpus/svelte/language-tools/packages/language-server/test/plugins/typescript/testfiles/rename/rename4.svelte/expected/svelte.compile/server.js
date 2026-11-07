import * as $ from 'svelte/internal/server';
import Child from './rename3.svelte';

export default function Rename4($$renderer) {
	let componentRef;

	$$renderer.push(`<main>`);
	Child($$renderer, {});
	$$renderer.push(`<!----> `);
	Child($$renderer, {});
	$$renderer.push(`<!----></main>`);
}