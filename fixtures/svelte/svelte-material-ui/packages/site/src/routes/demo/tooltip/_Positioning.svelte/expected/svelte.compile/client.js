import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import { Label } from '@smui/common';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="display: flex; flex-wrap: wrap; align-items: center;"><!> <!> <!> <!> <!> <!></div>`);

export default function _Positioning($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Wrapper(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Button(node_1, {
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('X Position: Start');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Tooltip(node_2, {
				xPos: 'start',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Tooltip.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Wrapper(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			Button(node_4, {
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('X Position: Center');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Tooltip(node_5, {
				xPos: 'center',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Tooltip.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Wrapper(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_7 = $.first_child(fragment_6);

			Button(node_7, {
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('X Position: End');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Tooltip(node_8, {
				xPos: 'end',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Tooltip.');

							$.append($$anchor, text_5);
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

	var node_9 = $.sibling(node_6, 2);

	Wrapper(node_9, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_10 = $.first_child(fragment_9);

			Button(node_10, {
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Y Position: Above');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Tooltip(node_11, {
				yPos: 'above',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Tooltip.');

							$.append($$anchor, text_7);
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

	var node_12 = $.sibling(node_9, 2);

	Wrapper(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root();
			var node_13 = $.first_child(fragment_12);

			Button(node_13, {
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Y Position: Below');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Tooltip(node_14, {
				yPos: 'below',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Tooltip.');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_12, 2);

	Wrapper(node_15, {
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root();
			var node_16 = $.first_child(fragment_15);

			Button(node_16, {
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('X Position: Start, Y Position: Above');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Tooltip(node_17, {
				xPos: 'start',
				yPos: 'above',
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Tooltip.');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}