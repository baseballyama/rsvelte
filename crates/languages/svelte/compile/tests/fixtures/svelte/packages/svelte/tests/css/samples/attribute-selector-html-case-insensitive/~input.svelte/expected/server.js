import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<form method="GET" class="svelte-gbyeyc"><h1 class="svelte-gbyeyc">Hello</h1></form> <form method="POST" class="svelte-gbyeyc"><h1 class="svelte-gbyeyc">World</h1></form> <input type="Text" class="svelte-gbyeyc"/>`);
}