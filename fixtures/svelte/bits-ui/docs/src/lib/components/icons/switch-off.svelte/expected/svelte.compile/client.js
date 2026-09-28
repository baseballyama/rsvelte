import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="bg-dark-10 shadow-mini-inset peer inline-flex h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[3px] transition-colors"><span class="bg-background shadow-mini dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-0 rounded-full transition-transform dark:border"></span></div>`);

export default function Switch_off($$anchor) {
	var div = root();

	$.append($$anchor, div);
}