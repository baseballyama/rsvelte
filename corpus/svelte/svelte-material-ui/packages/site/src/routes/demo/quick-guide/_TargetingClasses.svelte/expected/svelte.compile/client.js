import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<div class="svelte-847l7"><!></div>`);

export default function _TargetingClasses($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		class: 'myClass',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This button has a Class');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}