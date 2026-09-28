import * as $ from 'svelte/internal/server';

export default function Default($$renderer) {
	$$renderer.push(`<ol class="flex items-center gap-4"><li><a class="opacity-60 hover:underline" href="#">Blog</a></li> <li class="opacity-50" aria-hidden="">›</li> <li><a class="opacity-60 hover:underline" href="#">Category</a></li> <li class="opacity-50" aria-hidden="">›</li> <li>Article</li></ol>`);
}