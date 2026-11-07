import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BaseNotification from './BaseNotification.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'message']);
var root = $.from_html(`<p> </p>`);

export default function Toast($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	BaseNotification($$anchor, $.spread_props(() => rest, {
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $$props.message));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	}));
}