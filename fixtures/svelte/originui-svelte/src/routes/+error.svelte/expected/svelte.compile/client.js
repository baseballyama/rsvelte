import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<div class="flex h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4"><h3 class="text-svelte scroll-m-20 text-2xl font-semibold tracking-tight"> </h3> <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"> </h1></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var div = root();

	$.head('1j96wlh', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${page.status ?? ''}: ${page.error?.message ?? ''}`;
		});
	});

	var h3 = $.child(div);
	var text = $.only_child(h3, true);
	var h1 = $.sibling(h3, 2);
	var text_1 = $.only_child(h1, true);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, page.status);
		$.set_text(text_1, page.error?.message);
	});

	$.append($$anchor, div);
	$.pop();
}