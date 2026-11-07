import * as $ from 'svelte/internal/server';

function a($$renderer) {
	b($$renderer);
	$$renderer.push(`<!----> <div class="svelte-1tmf9qf">`);
	b($$renderer);
	$$renderer.push(`<!----></div>`);
}

function b($$renderer) {
	a($$renderer);
	$$renderer.push(`<!----> <div class="svelte-1tmf9qf">`);
	a($$renderer);
	$$renderer.push(`<!----></div>`);
}

function c($$renderer) {
	$$renderer.push(`<span class="svelte-1tmf9qf"></span> `);
	c($$renderer);
	$$renderer.push(`<!---->`);
}

export default function Input($$renderer) {}