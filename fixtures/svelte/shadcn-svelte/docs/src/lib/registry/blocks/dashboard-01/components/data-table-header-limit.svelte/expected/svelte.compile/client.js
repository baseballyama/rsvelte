import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full text-end">Limit</div>`);

export default function Data_table_header_limit($$anchor) {
	var div = root();

	$.append($$anchor, div);
}