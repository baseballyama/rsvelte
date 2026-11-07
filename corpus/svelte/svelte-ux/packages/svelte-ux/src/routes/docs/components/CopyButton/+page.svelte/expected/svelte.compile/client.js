import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid gap-2"><div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div></div>`);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Size</h2> <!> <h2>Using a Function</h2> <!> <h2>With Custom Message</h2> <!> <h2>With Alternate Notification</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			CopyButton(node_1, { value: 'Stop copying me!' });
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			CopyButton(node_2, { value: 'Stop copying me!', color: 'primary' });
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_3 = $.child(div_3);

			CopyButton(node_3, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'outline'
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_4 = $.child(div_4);

			CopyButton(node_4, { value: 'Stop copying me!', color: 'primary', variant: 'fill' });
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_5 = $.child(div_5);

			CopyButton(node_5, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-light'
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_6 = $.child(div_6);

			CopyButton(node_6, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-outline'
			});

			$.reset(div_6);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var div_7 = root();
			var div_8 = $.child(div_7);
			var node_8 = $.child(div_8);

			CopyButton(node_8, { value: 'Stop copying me!', size: 'sm' });
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_9 = $.child(div_9);

			CopyButton(node_9, { value: 'Stop copying me!', color: 'primary', size: 'sm' });
			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var node_10 = $.child(div_10);

			CopyButton(node_10, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'outline',
				size: 'sm'
			});

			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var node_11 = $.child(div_11);

			CopyButton(node_11, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill',
				size: 'sm'
			});

			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var node_12 = $.child(div_12);

			CopyButton(node_12, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-light',
				size: 'sm'
			});

			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var node_13 = $.child(div_13);

			CopyButton(node_13, {
				value: 'Stop copying me!',
				color: 'primary',
				variant: 'fill-outline',
				size: 'sm'
			});

			$.reset(div_13);
			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_7, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			CopyButton($$anchor, { value: () => 'Stop copying me!' });
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			CopyButton($$anchor, { value: 'Stop copying me!', message: 'I copied it...' });
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			CopyButton($$anchor, {
				value: 'Stop copying me!',
				message: null,
				$$events: { click: () => alert('Copied!') }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}