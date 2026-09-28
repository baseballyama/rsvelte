import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Group, Label } from '@smui/button';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <br/> <br/> <!> <pre class="status"> </pre>`, 1);

export default function _Groups($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Group(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('One');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Two');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				onclick: () => $.update(clicked),
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Three');

							$.append($$anchor, text_2);
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

	var node_4 = $.sibling(node, 2);

	Group(node_4, {
		variant: 'raised',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_5 = $.first_child(fragment_5);

			Button(node_5, {
				onclick: () => $.update(clicked),
				variant: 'raised',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('One');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				onclick: () => $.update(clicked),
				variant: 'raised',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Two');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				onclick: () => $.update(clicked),
				variant: 'raised',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Three');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	Group(node_8, {
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_9 = $.first_child(fragment_9);

			Button(node_9, {
				onclick: () => $.update(clicked),
				variant: 'unelevated',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('One');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				onclick: () => $.update(clicked),
				variant: 'unelevated',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Two');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				onclick: () => $.update(clicked),
				variant: 'unelevated',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Three');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_8, 2);

	Group(node_12, {
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root();
			var node_13 = $.first_child(fragment_13);

			Button(node_13, {
				onclick: () => $.update(clicked),
				variant: 'outlined',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('One');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Button(node_14, {
				onclick: () => $.update(clicked),
				variant: 'outlined',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Two');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Button(node_15, {
				onclick: () => $.update(clicked),
				variant: 'outlined',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Three');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_12, 6);

	Group(node_16, {
		variant: 'unelevated',
		style: 'display: flex; justify-content: stretch;',
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root();
			var node_17 = $.first_child(fragment_17);

			Button(node_17, {
				onclick: () => $.update(clicked),
				variant: 'unelevated',
				color: 'primary',
				style: 'width: 60%;',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Primary');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Button(node_18, {
				onclick: () => $.update(clicked),
				variant: 'unelevated',
				color: 'secondary',
				style: 'flex-grow: 1;',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Secondary');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Button(node_19, {
				onclick: () => $.update(clicked),
				variant: 'unelevated',
				color: 'secondary',
				style: 'flex-grow: 1;',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Secondary');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_16, 2);
	var text_15 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_15, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}