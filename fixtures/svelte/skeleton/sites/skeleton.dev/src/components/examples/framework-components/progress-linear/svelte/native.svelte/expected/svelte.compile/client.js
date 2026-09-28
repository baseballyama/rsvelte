import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<progress class="progress" value="50" max="100"></progress>`);

export default function Native($$anchor) {
	var progress = root();

	$.append($$anchor, progress);
}