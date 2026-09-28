import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Fixed from './_Fixed.svelte';
import General from './_General.svelte';
import Icon from './_Icon.svelte';
import DisableAutoClose from './_DisableAutoClose.svelte';

var root = $.from_html(`<!> <section class="svelte-z2xaz"><h2 class="svelte-z2xaz">Banner</h2> <h5 class="svelte-z2xaz">Installation</h5> <pre class="demo-spaced svelte-z2xaz">npm i -D @smui/banner</pre> <h5 class="svelte-z2xaz">Demos</h5> <!> <!> <!> <!></section>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.head('z2xaz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Banner - SMUI';
		});
	});

	var node = $.first_child(fragment);

	Fixed(node, {});

	var section = $.sibling(node, 2);
	var node_1 = $.sibling($.child(section), 8);

	Demo(node_1, { component: 'Shown above.', file: 'banner/_Fixed.svelte' });

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return General;
		},
		file: 'banner/_General.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Banner options');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Icon;
		},
		file: 'banner/_Icon.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Banner with icon');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return DisableAutoClose;
		},
		file: 'banner/_DisableAutoClose.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Disable auto close');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, fragment);
}