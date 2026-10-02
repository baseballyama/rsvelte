import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Hello_world02_input($$renderer) {
	$$renderer.push(`<p class="svelte-oa79xh">These styles...</p> `);
	Nested($$renderer, {});
	$$renderer.push(`<!---->`);
}