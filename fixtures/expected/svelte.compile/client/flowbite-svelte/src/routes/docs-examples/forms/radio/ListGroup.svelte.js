import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<p class="mb-4 font-semibold text-gray-900 dark:text-white">Technology <span class="capitalize"> </span></p> <ul class="w-48 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800"><li><!></li> <li><!></li> <li><!></li> <li><!></li></ul>`, 1);

export default function ListGroup($$anchor) {
	const binding_group = [];
	let technology = $.state("svelte");
	var fragment = root();
	var p = $.first_child(fragment);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);

	var ul = $.sibling(p, 2);
	var li = $.child(ul);
	var node = $.child(li);

	Radio(node, {
		classes: { label: "p-3" },
		value: 'svelte',
		get group() {
			return $.get(technology);
		},

		set group($$value) {
			$.set(technology, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Svelte');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_1 = $.child(li_1);

	Radio(node_1, {
		classes: { label: "p-3" },
		value: 'vue js',
		get group() {
			return $.get(technology);
		},

		set group($$value) {
			$.set(technology, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Vue JS');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var node_2 = $.child(li_2);

	Radio(node_2, {
		classes: { label: "p-3" },
		value: 'react',
		get group() {
			return $.get(technology);
		},

		set group($$value) {
			$.set(technology, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('React');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var node_3 = $.child(li_3);

	Radio(node_3, {
		classes: { label: "p-3" },
		value: 'angular',
		get group() {
			return $.get(technology);
		},

		set group($$value) {
			$.set(technology, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Angular');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(li_3);
	$.reset(ul);
	$.template_effect(() => $.set_text(text, $.get(technology)));
	$.append($$anchor, fragment);
}