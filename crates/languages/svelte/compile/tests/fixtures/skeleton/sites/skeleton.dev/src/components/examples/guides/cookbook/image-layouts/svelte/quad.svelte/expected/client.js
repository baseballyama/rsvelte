import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section class="grid grid-cols-2 gap-4"><img class="h-64 w-64 bg-surface-500 rounded-container" src="https://picsum.photos/256/256?random=1" alt=""/> <img class="h-64 w-64 bg-surface-500 rounded-container" src="https://picsum.photos/256/256?random=2" alt=""/> <img class="h-64 w-64 bg-surface-500 rounded-container" src="https://picsum.photos/256/256?random=3" alt=""/> <img class="h-64 w-64 bg-surface-500 rounded-container" src="https://picsum.photos/256/256?random=4" alt=""/></section>`);

export default function Quad($$anchor) {
	var section = root();

	$.append($$anchor, section);
}