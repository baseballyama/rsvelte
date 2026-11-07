import * as $ from 'svelte/internal/server';
import Form from './form.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<form><div>`);
	Form($$renderer, {});
	$$renderer.push(`<!----></div></form>`);
}