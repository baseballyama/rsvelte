import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="flex gap-6"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Checkbox_08($$anchor) {
	const uid = $.props_id();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Checkbox(node, {
		get id() {
			return `${uid}-a`;
		}
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return `${uid}-a`;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Svelte');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Checkbox(node_2, {
		get id() {
			return `${uid}-b`;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Label(node_3, {
		get for() {
			return `${uid}-b`;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('SvelteKit');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_4 = $.child(div_3);

	Checkbox(node_4, {
		get id() {
			return `${uid}-c`;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Label(node_5, {
		get for() {
			return `${uid}-c`;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Astro');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}