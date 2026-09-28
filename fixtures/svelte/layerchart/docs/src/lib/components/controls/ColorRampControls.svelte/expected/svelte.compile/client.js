import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NumberStepper } from 'svelte-ux';

var root = $.from_html(`<div class="inline-flex gap-3 items-center mb-4 screenshot-hidden"><span class="text-sm text-surface-content/50">Steps:</span> <!></div>`);

export default function ColorRampControls($$anchor, $$props) {
	$.push($$props, true);

	let steps = $.prop($$props, 'steps', 15, undefined);
	var div = root();
	var node = $.sibling($.child(div), 2);

	NumberStepper(node, {
		dense: true,
		get value() {
			return steps();
		},

		set value($$value) {
			steps($$value);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}