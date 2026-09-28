import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="drag-region svelte-tovx2c" data-tauri-drag-region=""></div>`);

export default function DragRegion($$anchor) {
	var div = root();

	$.append($$anchor, div);
}