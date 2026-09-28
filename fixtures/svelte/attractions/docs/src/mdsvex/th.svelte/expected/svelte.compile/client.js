import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from 'attractions';

var root = $.from_html(`<th><!></th>`);

export default function Th($$anchor, $$props) {
	var th = root();
	var node = $.child(th);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.slot(node_1, $$props, 'default', {}, null);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(th);
	$.append($$anchor, th);
}