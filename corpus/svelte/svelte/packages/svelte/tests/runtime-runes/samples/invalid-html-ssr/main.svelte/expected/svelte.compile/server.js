import * as $ from 'svelte/internal/server';
import Form from './form.svelte';
import H1 from './h1.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<p>`);
	H1($$renderer, {});
	$$renderer.push(`<!----></p> <form>`);
	Form($$renderer, {});
	$$renderer.push(`<!----></form>`);
}