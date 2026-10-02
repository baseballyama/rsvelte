import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="text-brand text-nowrap">shadcn-svelte-extras</span>`);

export default function Shadcn_svelte_extras($$anchor) {
	var span = root();

	$.append($$anchor, span);
}