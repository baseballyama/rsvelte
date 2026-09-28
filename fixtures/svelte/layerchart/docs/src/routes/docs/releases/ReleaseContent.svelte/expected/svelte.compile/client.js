import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="release-content svelte-1jyaygr"></div>`);

export default function ReleaseContent($$anchor, $$props) {
	$.push($$props, true);

	var div = root();

	$.html(div, () => $$props.release.html, true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}