import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<y class="svelte-31blhk"></y>`);
}

export default function Input($$renderer) {
	$$renderer.push(`<x class="svelte-31blhk">this should be green `);
	foo($$renderer);
	$$renderer.push(`<!----></x> <z><p class="svelte-31blhk">this should be green</p> `);
	foo($$renderer);
	$$renderer.push(`<!----></z>`);
}