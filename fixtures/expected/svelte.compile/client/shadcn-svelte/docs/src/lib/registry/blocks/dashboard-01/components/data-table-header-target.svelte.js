import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full text-end">Target</div>`);

export default function Data_table_header_target($$anchor) {
	var div = root();

	$.append($$anchor, div);
}