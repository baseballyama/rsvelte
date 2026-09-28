import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { buttonVariants } from "$lib/styles/buttonVariants.js";

var root = $.from_html(`<section class="flex h-[calc(100vh_-_71px_-_8rem)] flex-col items-center justify-center gap-3"><h1 class="text-foreground text-6xl font-bold tracking-wider"> </h1> <p class="text-foreground"> </p> <a href="/docs">Back to docs</a></section>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const message = $.derived(() => page.status === 404 ? "Not Found" : "Something went wrong");
	var section = root();
	var h1 = $.child(section);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);
	var a = $.sibling(p, 2);

	$.reset(section);

	$.template_effect(
		($0) => {
			$.set_text(text, page.status);
			$.set_text(text_1, $.get(message));
			$.set_class(a, 1, $0);
		},
		[() => $.clsx(buttonVariants({ size: "lg" }))]
	);

	$.append($$anchor, section);
	$.pop();
}