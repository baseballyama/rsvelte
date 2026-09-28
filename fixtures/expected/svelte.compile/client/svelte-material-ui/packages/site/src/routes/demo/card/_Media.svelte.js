import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card, { Content, PrimaryAction, Media, MediaContent } from '@smui/card';

var root = $.from_html(`<h2 class="mdc-typography--headline6 svelte-6fdquk" style="color: #fff; position: absolute; bottom: 16px; left: 16px; margin: 0;">A card with 16x9 media.</h2>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div style="color: #fff; position: absolute; bottom: 16px; left: 16px;" class="svelte-6fdquk"><h2 class="mdc-typography--headline6 svelte-6fdquk" style="margin: 0;">A card with square media.</h2> <h3 class="mdc-typography--subtitle2 svelte-6fdquk" style="margin: 0;">And a subtitle.</h3></div>`);
var root_3 = $.from_html(`<div style="padding: 1rem;" class="svelte-6fdquk"><h2 class="mdc-typography--headline6 svelte-6fdquk" style="margin: 0;">A card with media.</h2> <h3 class="mdc-typography--subtitle2 svelte-6fdquk" style="margin: 0; color: #888;">And a subtitle.</h3></div> <!>`, 1);
var root_4 = $.from_html(`<div class="card-display svelte-6fdquk"><div class="card-container svelte-6fdquk"><!></div> <div class="card-container svelte-6fdquk"><!></div> <div class="card-container svelte-6fdquk"><!></div></div> <pre class="status svelte-6fdquk"> </pre>`, 1);

export default function _Media($$anchor) {
	let clicked = $.state(0);
	var fragment = root_4();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Card(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Media(node_1, {
				class: 'card-media-16x9',
				aspectRatio: '16x9',
				children: ($$anchor, $$slotProps) => {
					MediaContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var h2 = root();

							$.append($$anchor, h2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				style: 'color: #888;',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Here\'s some gray text down here.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	Card(node_3, {
		style: 'min-width: 300px;',
		children: ($$anchor, $$slotProps) => {
			Media($$anchor, {
				class: 'card-media-square',
				aspectRatio: 'square',
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_2();

					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_4 = $.child(div_4);

	Card(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_3();
			var node_5 = $.sibling($.first_child(fragment_4), 2);

			PrimaryAction(node_5, {
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_6 = $.first_child(fragment_5);

					Media(node_6, { class: 'card-media-16x9', aspectRatio: '16x9' });

					var node_7 = $.sibling(node_6, 2);

					Content(node_7, {
						class: 'mdc-typography--body2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('And some info text. And the media and info text are a primary action\n          for the card.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}