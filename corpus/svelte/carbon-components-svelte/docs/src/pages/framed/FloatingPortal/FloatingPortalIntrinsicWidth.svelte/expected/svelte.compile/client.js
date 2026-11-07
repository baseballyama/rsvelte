import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, FloatingPortal, Tile } from "carbon-components-svelte";

var root = $.from_html(`<div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true" title="Drag to move, click to toggle"><!></div></div> <!>`, 1);

export default function FloatingPortalIntrinsicWidth($$anchor, $$props) {
	$.push($$props, true);

	let anchor = null;
	let container = null;
	let open = false;
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;
	let offsetX = 0;
	let offsetY = 0;
	const emptyImage = new Image();

	emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

	function handleDragStart(e) {
		const rect = anchor.getBoundingClientRect();

		offsetX = e.clientX - rect.left;
		offsetY = e.clientY - rect.top;
		startX = x;
		startY = y;
		e.dataTransfer.setDragImage(emptyImage, 0, 0);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", "");
	}

	function handleDrag(e) {
		if ((e.clientX !== 0 || e.clientY !== 0) && container) {
			const parentRect = container.getBoundingClientRect();

			if (e.clientX >= parentRect.left && e.clientX <= parentRect.right && e.clientY >= parentRect.top && e.clientY <= parentRect.bottom) {
				x = e.clientX - offsetX - parentRect.left;
				y = e.clientY - offsetY - parentRect.top;
			}
		}
	}

	function handleDragEnd() {
		const moved = Math.abs(x - startX) > 5 || Math.abs(y - startY) > 5;

		if (!moved) {
			open = !open;
		}
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Tile(node, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				$$events: { click: () => open = !open },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Toggle floating content');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => anchor = $$value, () => anchor);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	var node_1 = $.sibling(div, 2);

	FloatingPortal(node_1, {
		get anchor() {
			return anchor;
		},

		get open() {
			return open;
		},
		intrinsicWidth: true,
		children: ($$anchor, $$slotProps) => {
			Tile($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Centered on anchor');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.template_effect(() => $.set_style(div_1, `position: absolute; left: ${x ?? ''}px; top: ${y ?? ''}px; cursor: move; user-select: none;`));
	$.event('dragstart', div_1, handleDragStart);
	$.event('drag', div_1, handleDrag);
	$.event('dragend', div_1, handleDragEnd);

	$.event('keydown', div_1, (e) => {
		if (e.key === "Enter") open = !open;
	});

	$.append($$anchor, fragment);
	$.pop();
}