import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Notification } from 'svelte-ux';
import { colors } from '@layerstack/tailwind';
import { toTitleCase } from '@layerstack/utils';

import {
	mdiInbox,
	mdiCheckCircleOutline,
	mdiInformationOutline,
	mdiAlertOutline,
	mdiAlertOctagonOutline
} from '@mdi/js';

import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="w-[400px]"><!></div>`);
var root_1 = $.from_html(`<div class="w-[600px]"><!></div>`);
var root_2 = $.from_html(`<div class="grid gap-2 w-[400px]"></div>`);
var root_3 = $.from_html(`<div class="grid gap-2 w-[600px]"></div>`);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Description</h2> <!> <h2>Icon</h2> <!> <h2>Icon with description</h2> <!> <h2>Actions (inline / default)</h2> <!> <h2>Actions (below)</h2> <!> <h2>Actions (split)</h2> <!> <h2>Color</h2> <!> <h2>Variant (fill)</h2> <!> <h2>Variant (fill) with inline actions</h2> <!> <h2>Variant (fill) with actions below</h2> <!> <h2>Variant (fill) with split actions</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function themeColorIcon(color) {
		switch (color) {
			case 'accent':
				return mdiInformationOutline;

			case 'success':
				return mdiCheckCircleOutline;

			case 'neutral':
				return mdiInformationOutline;

			case 'danger':
				return mdiAlertOctagonOutline;

			case 'primary':
				return mdiInformationOutline;

			case 'secondary':
				return mdiInformationOutline;

			case 'info':
				return mdiInformationOutline;

			case 'warning':
				return mdiAlertOutline;
		}
	}

	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			Notification(node_1, { title: 'New software update available.', closeIcon: true });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_3 = $.child(div_1);

			Notification(node_3, {
				title: 'Successfully Saved!',
				description: 'Anyone with a link can now view this file.',
				closeIcon: true
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root();
			var node_5 = $.child(div_2);

			Notification(node_5, {
				title: 'Successfully Saved!',
				get icon() {
					return mdiCheckCircleOutline;
				},
				color: 'success',
				closeIcon: true
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root();
			var node_7 = $.child(div_3);

			Notification(node_7, {
				title: 'Successfully Saved!',
				description: 'Anyone with a link can now view this file.',
				get icon() {
					return mdiCheckCircleOutline;
				},
				color: 'success',
				closeIcon: true
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root();
			var node_9 = $.child(div_4);

			Notification(node_9, {
				title: 'Discussion archived',
				actions: { Undo: () => alert('Undo') },
				closeIcon: true
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root();
			var node_11 = $.child(div_5);

			Notification(node_11, {
				title: 'Discussion moved',
				description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit oluptatum tenetur.',
				get icon() {
					return mdiInbox;
				},
				actions: { Undo: () => alert('Undo'), Dismiss: () => {} },
				actionsPlacement: 'below',
				closeIcon: true
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_10, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_1();
			var node_13 = $.child(div_6);

			Notification(node_13, {
				title: 'Receive notifications',
				description: 'Notifications may include alerts, sounds, and badges',
				actions: {
					Allow: () => alert('Allow'),
					"Don't Allow": () => alert("Don't Allow")
				},
				actionsPlacement: 'split',
				classes: { actions: 'w-40' }
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_12, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			var div_7 = root_2();

			$.each(div_7, 21, () => colors, $.index, ($$anchor, color) => {
				{
					let $0 = $.derived(() => toTitleCase($.get(color)));
					let $1 = $.derived(() => themeColorIcon($.get(color)));

					Notification($$anchor, {
						get title() {
							return $.get($0);
						},

						get description() {
							return `An example using ${$.get(color) ?? ''} color`;
						},

						get icon() {
							return $.get($1);
						},

						get color() {
							return $.get(color);
						},
						closeIcon: true
					});
				}
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_2();

			$.each(div_8, 21, () => colors, $.index, ($$anchor, color) => {
				{
					let $0 = $.derived(() => toTitleCase($.get(color)));
					let $1 = $.derived(() => themeColorIcon($.get(color)));

					Notification($$anchor, {
						get title() {
							return $.get($0);
						},

						get description() {
							return `An example using ${$.get(color) ?? ''} color`;
						},

						get icon() {
							return $.get($1);
						},

						get color() {
							return $.get(color);
						},
						variant: 'fill',
						closeIcon: true
					});
				}
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_2();

			$.each(div_9, 21, () => colors, $.index, ($$anchor, color) => {
				Notification($$anchor, {
					get title() {
						return `Example using ${$.get(color) ?? ''} color`;
					},

					get color() {
						return $.get(color);
					},
					variant: 'fill',
					actions: { Undo: () => alert('Undo') },
					closeIcon: true
				});
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_2();

			$.each(div_10, 21, () => colors, $.index, ($$anchor, color) => {
				{
					let $0 = $.derived(() => toTitleCase($.get(color)));
					let $1 = $.derived(() => themeColorIcon($.get(color)));

					Notification($$anchor, {
						get title() {
							return $.get($0);
						},

						get description() {
							return `An example using ${$.get(color) ?? ''} color`;
						},

						get icon() {
							return $.get($1);
						},

						get color() {
							return $.get(color);
						},
						variant: 'fill',
						actions: {
							Allow: () => alert('Allow'),
							"Don't Allow": () => alert("Don't Allow")
						},
						actionsPlacement: 'below'
					});
				}
			});

			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var div_11 = root_3();

			$.each(div_11, 21, () => colors, $.index, ($$anchor, color) => {
				{
					let $0 = $.derived(() => toTitleCase($.get(color)));
					let $1 = $.derived(() => themeColorIcon($.get(color)));

					Notification($$anchor, {
						get title() {
							return $.get($0);
						},

						get description() {
							return `An example using ${$.get(color) ?? ''} color`;
						},

						get icon() {
							return $.get($1);
						},

						get color() {
							return $.get(color);
						},
						variant: 'fill',
						actions: {
							Allow: () => alert('Allow'),
							"Don't Allow": () => alert("Don't Allow")
						},
						actionsPlacement: 'split',
						classes: { actions: 'w-40' }
					});
				}
			});

			$.reset(div_11);
			$.append($$anchor, div_11);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}