import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {});
	$$renderer.push(`<!----> <div class="foo svelte-1nvcr6w">foo</div>`);
}