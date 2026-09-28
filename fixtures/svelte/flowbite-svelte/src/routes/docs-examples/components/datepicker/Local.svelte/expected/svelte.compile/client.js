import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-64 md:w-1/2"><!></div>`);

export default function Local($$anchor) {
	var div = root();
	var node = $.child(div);

	Datepicker(node, { locale: 'de-DE', translationLocale: 'en-US' });
	$.reset(div);
	$.append($$anchor, div);
}