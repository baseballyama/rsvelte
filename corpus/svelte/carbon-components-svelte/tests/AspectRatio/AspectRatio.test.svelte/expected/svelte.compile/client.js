import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AspectRatio from "carbon-components-svelte/AspectRatio/AspectRatio.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function AspectRatio_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	AspectRatio(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('2x1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	AspectRatio(node_1, {
		ratio: '2x3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('2x3');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	AspectRatio(node_2, {
		ratio: '16x9',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('16x9');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	AspectRatio(node_3, {
		ratio: '4x3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('4x3');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	AspectRatio(node_4, {
		ratio: '1x1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('1x1');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	AspectRatio(node_5, {
		ratio: '3x4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('3x4');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	AspectRatio(node_6, {
		ratio: '3x2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('3x2');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	AspectRatio(node_7, {
		ratio: '9x16',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('9x16');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	AspectRatio(node_8, {
		ratio: '1x2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('1x2');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}