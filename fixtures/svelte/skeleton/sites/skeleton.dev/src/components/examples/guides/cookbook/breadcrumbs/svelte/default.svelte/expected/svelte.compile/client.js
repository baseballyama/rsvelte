import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ol class="flex items-center gap-4"><li><a class="opacity-60 hover:underline" href="#">Blog</a></li> <li class="opacity-50" aria-hidden="">&rsaquo;</li> <li><a class="opacity-60 hover:underline" href="#">Category</a></li> <li class="opacity-50" aria-hidden="">&rsaquo;</li> <li>Article</li></ol>`);

export default function Default($$anchor) {
	var ol = root();

	$.append($$anchor, ol);
}