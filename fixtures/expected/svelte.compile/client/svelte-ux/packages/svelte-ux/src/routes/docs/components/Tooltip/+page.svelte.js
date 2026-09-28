import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiTrashCan } from '@mdi/js';
import { Button, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="title" class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 bg-surface-content text-surface-100 px-4 py-2 text-xs rounded shadow"><div class="col-span-2 justify-self-center text-sm font-semibold">Tue, March 30</div> <div class="text-surface-100/50 justify-self-end">Actual:</div> <div class="justify-self-end">123.50</div> <div class="text-surface-100/50 justify-self-end">Target:</div> <div class="justify-self-end">90.00</div> <div class="text-surface-100/50 justify-self-end">Variance:</div> <div class="justify-self-end">33.50</div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1>Examples</h1> <h2>Button</h2> <!> <h2>Icon button</h2> <!> <h2>Slot w/ custom markup</h2> <!> <h2>Placement</h2> <!> <h2>Offset</h2> <!> <h2>Overlap</h2> <!> <h2>Underline & cursor</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				title: 'Hello',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Hover me');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				title: 'Click to remove',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiTrashCan;
						},
						class: 'w-12 h-12'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Hover me');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var div = root();

						$.append($$anchor, div);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_1();
			var node_4 = $.first_child(fragment_7);

			Tooltip(node_4, {
				title: 'Hello',
				placement: 'left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Left');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Tooltip(node_5, {
				title: 'Hello',
				placement: 'top',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Top');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Tooltip(node_6, {
				title: 'Hello',
				placement: 'bottom',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Bottom');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Tooltip(node_7, {
				title: 'Hello',
				placement: 'right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Right');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_3, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_1();
			var node_9 = $.first_child(fragment_12);

			Tooltip(node_9, {
				title: 'Hello',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Hover me');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Tooltip(node_10, {
				title: 'Hello',
				offset: 2,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Hover me');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Tooltip(node_11, {
				title: 'Hello',
				offset: 4,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Hover me');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Tooltip(node_12, {
				title: 'Hello',
				offset: 8,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Hover me');

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

	var node_13 = $.sibling(node_8, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				title: 'Hello',
				offset: -8,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Hover me');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				title: 'Hello',
				underline: true,
				cursor: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Hover me');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}