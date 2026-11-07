import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

var root = $.from_html(`The content for panel 1. <ul><li>Some</li> <li>List</li> <li>Items</li></ul>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`The content for panel 3. <ul><li>Some</li> <li>More</li> <li>List</li> <li>Items</li> <li>To</li> <li>Show</li> <li>Big</li> <li>Height</li></ul>`, 1);
var root_3 = $.from_html(`If you like this component, you can thank <a href="https://github.com/NickantX" target="_blank">nick</a> who pushed me to make it. He was right, accordions are awesome! :D`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="accordion-container"><!></div>`);

export default function _Simple($$anchor) {
	var div = root_5();
	var node = $.child(div);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_1 = $.first_child(fragment);

			Panel(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_2 = $.first_child(fragment_1);

					Header(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Panel 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Content(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_2 = root();

							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Panel(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					Header(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Panel 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Content(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('The content for panel 2.');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Panel(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_8 = $.first_child(fragment_4);

					Header(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Panel 3');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Content(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_5 = root_2();

							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_7, 2);

			Panel(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_11 = $.first_child(fragment_6);

					Header(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Panel 4');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Content(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_7 = root_3();

							$.next(2);
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}