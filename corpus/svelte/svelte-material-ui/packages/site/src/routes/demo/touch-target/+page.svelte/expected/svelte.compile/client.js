import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';

var root = $.from_html(`<section><h2>Touch Target</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/touch-target</pre> <h5>Demos</h5> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('14qd1u', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Touch Target - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text = $.text('These interactive components all have large touch targets, and they won\'t\n      overlap because of the touch target wrapper.');

			$.append($$anchor, text);
		};

		Demo(node, {
			get component() {
				return Simple;
			},
			file: 'touch-target/_Simple.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Touch Target Wrapper');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}