import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

var root = $.from_html(`<div class="inline-flex items-center gap-2"><!> <!></div>`);

export default function Switch_08($$anchor) {
	const uid = $.props_id();
	let checked = $.state(true);
	var div = root();
	var node = $.child(div);

	Switch(node, {
		get id() {
			return uid;
		},
		'aria-label': 'Toggle switch',
		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},
		class: 'text-sm font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(checked) ? 'On' : 'Off'));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}