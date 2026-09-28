import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

var root = $.from_html(`The content for panel 1. <ul><li>Some</li> <li>List</li> <li>Items</li></ul>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`The content for panel 3. <ul><li>Some</li> <li>More</li> <li>List</li> <li>Items</li> <li>To</li> <li>Show</li> <li>Big</li> <li>Height</li></ul>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="accordion-container"><!></div>`);

export default function _Extend($$anchor) {
	var div = root_4();
	var node = $.child(div);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var node_1 = $.first_child(fragment);

			Panel(node_1, {
				extend: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_2 = $.first_child(fragment_1);

					{
						const description = ($$anchor) => {
							$.next();

							var text = $.text('Description of panel 1.');

							$.append($$anchor, text);
						};

						Header(node_2, {
							description,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Panel 1');

								$.append($$anchor, text_1);
							},
							$$slots: { description: true, default: true }
						});
					}

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
				extend: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					{
						const description = ($$anchor) => {
							$.next();

							var text_2 = $.text('Description of panel 2.');

							$.append($$anchor, text_2);
						};

						Header(node_5, {
							description,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Panel 2');

								$.append($$anchor, text_3);
							},
							$$slots: { description: true, default: true }
						});
					}

					var node_6 = $.sibling(node_5, 2);

					Content(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('The content for panel 2.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Panel(node_7, {
				extend: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_8 = $.first_child(fragment_4);

					{
						const description = ($$anchor) => {
							$.next();

							var text_5 = $.text('Description of panel 3.');

							$.append($$anchor, text_5);
						};

						Header(node_8, {
							description,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Panel 3');

								$.append($$anchor, text_6);
							},
							$$slots: { description: true, default: true }
						});
					}

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
				extend: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_11 = $.first_child(fragment_6);

					{
						const description = ($$anchor) => {
							$.next();

							var text_7 = $.text('Description of panel 4.');

							$.append($$anchor, text_7);
						};

						Header(node_11, {
							description,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Panel 4');

								$.append($$anchor, text_8);
							},
							$$slots: { description: true, default: true }
						});
					}

					var node_12 = $.sibling(node_11, 2);

					Content(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('The content for panel 4.');

							$.append($$anchor, text_9);
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