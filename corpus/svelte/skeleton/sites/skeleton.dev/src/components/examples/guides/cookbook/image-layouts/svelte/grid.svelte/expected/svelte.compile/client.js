import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section class="grid grid-cols-2 gap-6 md:grid-cols-3"><img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=1" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=2" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=3" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=4" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=5" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=6" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=7" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=8" alt=""/> <img class="w-48 h-48 bg-surface-500 rounded-container" src="https://picsum.photos/192/192?random=9" alt=""/></section>`);

export default function Grid($$anchor) {
	var section = root();

	$.append($$anchor, section);
}