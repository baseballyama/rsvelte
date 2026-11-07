import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

var root = $.from_html(`<div><!></div>`);

export default function Input($$anchor) {
	var div = root();
	var node = $.child(div);

	Test(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const t = $.derived(() => $$slotProps.t);

				$.next();

				var text = $.text('xx');

				$.append($$anchor, text);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}