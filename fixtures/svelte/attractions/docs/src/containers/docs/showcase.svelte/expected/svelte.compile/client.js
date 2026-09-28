import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from 'attractions';
import CopyableCode from 'src/components/docs/copyable-code.svelte';

var root = $.from_html(`<section class="showcase"><!> <!> <!> <!></section>`);

export default function Showcase($$anchor, $$props) {
	var section = root();
	var node = $.child(section);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Showcase');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'showcase', {}, null);

	var node_2 = $.sibling(node_1, 2);

	Label(node_2, {
		class: 'code',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Source');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	CopyableCode(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_4 = $.first_child(fragment);

			$.slot(node_4, $$props, 'source', {}, null);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}