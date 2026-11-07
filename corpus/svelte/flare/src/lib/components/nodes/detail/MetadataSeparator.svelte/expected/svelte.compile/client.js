import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<hr class="border-gray-200 dark:border-gray-700"/>`);

export default function MetadataSeparator($$anchor, $$props) {
	var hr = root();

	$.append($$anchor, hr);
}