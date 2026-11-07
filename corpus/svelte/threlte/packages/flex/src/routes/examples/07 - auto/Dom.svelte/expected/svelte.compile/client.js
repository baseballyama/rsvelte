import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="red" style="width: 500px; height: 500px; display: flex; justify-content: center; align-items: stretch; gap: 20px; padding: 20px; box-sizing: border-box;"><div class="yellow" style="width: auto; height: auto; flex: 1;"></div> <div class="blue" style="width: auto; height: 200px; flex: 0.5"></div></div>`);

export default function Dom($$anchor) {
	var div = root();

	$.append($$anchor, div);
}