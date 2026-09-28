import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Center, SimpleGrid, Tooltip } from '@svelteuidev/core';

export const type = 'demo';
export const configuration = {};

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tooltip_demo_positions($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			SimpleGrid($$anchor, {
				cols: 3,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Tooltip(node, {
						position: 'top',
						placement: 'start',
						label: 'top-start',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('top-start');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Tooltip(node_1, {
						position: 'top',
						placement: 'center',
						label: 'top-center',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('top-center');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Tooltip(node_2, {
						position: 'top',
						placement: 'end',
						label: 'top-end',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('top-end');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Tooltip(node_3, {
						position: 'right',
						placement: 'start',
						label: 'right-start',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('right-start');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Tooltip(node_4, {
						position: 'right',
						placement: 'center',
						label: 'right-center',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('right-center');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Tooltip(node_5, {
						position: 'right',
						placement: 'end',
						label: 'right-end',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('right-end');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Tooltip(node_6, {
						position: 'bottom',
						placement: 'start',
						label: 'bottom-start',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('bottom-start');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Tooltip(node_7, {
						position: 'bottom',
						placement: 'center',
						label: 'bottom-center',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('bottom-center');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Tooltip(node_8, {
						position: 'bottom',
						placement: 'end',
						label: 'bottom-end',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('bottom-end');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Tooltip(node_9, {
						position: 'left',
						placement: 'start',
						label: 'left-start',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('left-start');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Tooltip(node_10, {
						position: 'left',
						placement: 'center',
						label: 'left-center',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('left-center');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Tooltip(node_11, {
						position: 'left',
						placement: 'end',
						label: 'left-end',
						withArrow: true,
						children: ($$anchor, $$slotProps) => {
							Badge($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('left-end');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}