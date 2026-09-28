import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="red" style="width: 500px; height: 500px; display: flex; gap: 10px; padding: 10px; box-sizing: border-box;"><div class="yellow" style="width: 100px; height: 100px;"></div> <div class="blue" style="width: 100px; height: 100px; flex: 1"></div></div>`);

export default function Dom($$anchor) {
	var div = root();

	$.append($$anchor, div);
}