import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "$lib";
import CompoDescription from "./CompoDescription.svelte";

var root = $.from_html(`<div class="border-b border-gray-200 pb-8 dark:border-gray-800"><!> <!></div>`);

export default function PageHeadSection($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	Heading(node, {
		class: 'mb-2 inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white',
		tag: 'h1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CompoDescription(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $$props.description));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}