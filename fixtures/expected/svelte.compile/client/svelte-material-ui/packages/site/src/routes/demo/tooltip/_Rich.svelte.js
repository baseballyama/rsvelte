import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip, { Wrapper, Title, Content, Link, RichActions } from '@smui/tooltip';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`An interactive rich tooltip can have <!> and actions.`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span role="button" tabindex="0">Persistent Rich Tooltip (Click Me)</span> <!>`, 1);
var root_4 = $.from_html(`<div style="display: flex; flex-wrap: wrap; align-items: center;"><!> <!> <!></div> <pre class="status"> </pre>`, 1);

export default function _Rich($$anchor) {
	let clicked = $.state(0);
	var fragment = root_4();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Wrapper(node, {
		rich: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				onclick: () => $.update(clicked),
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Rich Tooltip');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Tooltip(node_2, {
				children: ($$anchor, $$slotProps) => {
					Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('A rich tooltip can provide a lot more information than a regular toolip.\n        It is sized appropriately for a large amount of content.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Wrapper(node_3, {
		rich: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Button(node_4, {
				onclick: () => $.update(clicked),
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Interactive Rich Tooltip');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Tooltip(node_5, {
				interactive: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_2();
					var node_6 = $.first_child(fragment_6);

					Title(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('With a Title!');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Content(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_7 = root_1();
							var node_8 = $.sibling($.first_child(fragment_7));

							Link(node_8, {
								href: 'http://example.com',
								target: '_blank',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('links');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.next();
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_7, 2);

					RichActions(node_9, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								onclick: () => $.update(clicked),
								children: ($$anchor, $$slotProps) => {
									Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Action');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_3, 2);

	Wrapper(node_10, {
		rich: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_3();
			var node_11 = $.sibling($.first_child(fragment_10), 2);

			Tooltip(node_11, {
				persistent: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root();
					var node_12 = $.first_child(fragment_11);

					Title(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('With a Title!');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Content(node_13, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('A persistent rich tooltip shows up when you click or press enter/space\n        bar on an element and goes away when you activate it again or it loses\n        focus. Great for informational popups on those little "i" icons.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_8 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_8, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}