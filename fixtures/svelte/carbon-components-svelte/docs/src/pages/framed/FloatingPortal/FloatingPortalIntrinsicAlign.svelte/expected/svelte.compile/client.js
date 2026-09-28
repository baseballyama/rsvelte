import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, FloatingPortal, Tile } from "carbon-components-svelte";

var root = $.from_html(
	`<p style="margin-bottom: 1rem;">With <code>intrinsicWidth</code>, use <code>intrinsicAlign</code> to pin the
  floating box to the start, center, or end of the anchor along the cross axis
  (horizontal for top/bottom).</p> <div style="display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start;"><div><div><!></div> <!></div> <div><div><!></div> <!></div> <div><div><!></div> <!></div></div>`,
	1
);

export default function FloatingPortalIntrinsicAlign($$anchor) {
	let anchorStart = null;
	let anchorCenter = null;
	let anchorEnd = null;
	let openStart = false;
	let openCenter = false;
	let openEnd = false;
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Button(node, {
		$$events: { click: () => openStart = !openStart },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Start');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => anchorStart = $$value, () => anchorStart);

	var node_1 = $.sibling(div_2, 2);

	FloatingPortal(node_1, {
		get anchor() {
			return anchorStart;
		},

		get open() {
			return openStart;
		},
		intrinsicWidth: true,
		intrinsicAlign: 'start',
		children: ($$anchor, $$slotProps) => {
			Tile($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Align start');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node_2 = $.child(div_4);

	Button(node_2, {
		$$events: { click: () => openCenter = !openCenter },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Center');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.bind_this(div_4, ($$value) => anchorCenter = $$value, () => anchorCenter);

	var node_3 = $.sibling(div_4, 2);

	FloatingPortal(node_3, {
		get anchor() {
			return anchorCenter;
		},

		get open() {
			return openCenter;
		},
		intrinsicWidth: true,
		intrinsicAlign: 'center',
		children: ($$anchor, $$slotProps) => {
			Tile($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Align center');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var node_4 = $.child(div_6);

	Button(node_4, {
		$$events: { click: () => openEnd = !openEnd },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('End');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.bind_this(div_6, ($$value) => anchorEnd = $$value, () => anchorEnd);

	var node_5 = $.sibling(div_6, 2);

	FloatingPortal(node_5, {
		get anchor() {
			return anchorEnd;
		},

		get open() {
			return openEnd;
		},
		intrinsicWidth: true,
		intrinsicAlign: 'end',
		children: ($$anchor, $$slotProps) => {
			Tile($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Align end');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div);
	$.append($$anchor, fragment);
}