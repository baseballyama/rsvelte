import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";

var root = $.from_html(`<div class="mx-auto flex max-w-5xl justify-center px-4"></div>`);

export default function KenerFooter($$anchor) {
	let { data } = page;
	var div = root();

	$.html(div, () => data.footerHTML, true);
	$.reset(div);
	$.append($$anchor, div);
}