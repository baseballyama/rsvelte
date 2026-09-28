import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<ol><li><a href="#p1">first paragraph</a></li> <li><a href="#p2">second paragraph</a></li></ol> <p tabindex="-1" id="p1" class="svelte-4kv4k5">paragraph 1</p> <p tabindex="-1" id="p2" class="svelte-4kv4k5">paragraph 2</p> <li><button>next focus element</button></li>`);
}