import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, FloatingPortal, Stack, Tile } from "carbon-components-svelte";

var root = $.from_html(`<div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true" title="Drag to move, click to toggle"><!></div> <!></div> <div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true" title="Drag to move, click to toggle"><!></div> <!></div>`, 1);

export default function FloatingPortalDirection($$anchor, $$props) {
	$.push($$props, true);

	let anchorTop = null;
	let anchorBottom = null;
	let containerBottom = null;
	let containerTop = null;
	let openTop = false;
	let openBottom = false;
	let xBottom = 0;
	let yBottom = 0;
	let xTop = 0;
	let yTop = 0;
	let startXBottom = 0;
	let startYBottom = 0;
	let startXTop = 0;
	let startYTop = 0;
	let offsetX = 0;
	let offsetY = 0;
	const emptyImage = new Image();

	emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

	function handleDragStartBottom(e) {
		const rect = anchorBottom.getBoundingClientRect();

		offsetX = e.clientX - rect.left;
		offsetY = e.clientY - rect.top;
		startXBottom = xBottom;
		startYBottom = yBottom;
		e.dataTransfer.setDragImage(emptyImage, 0, 0);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", "");
	}

	function handleDragStartTop(e) {
		const rect = anchorTop.getBoundingClientRect();

		offsetX = e.clientX - rect.left;
		offsetY = e.clientY - rect.top;
		startXTop = xTop;
		startYTop = yTop;
		e.dataTransfer.setDragImage(emptyImage, 0, 0);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", "");
	}

	function handleDragBottom(e) {
		if ((e.clientX !== 0 || e.clientY !== 0) && containerBottom) {
			const parentRect = containerBottom.getBoundingClientRect();

			if (e.clientX >= parentRect.left && e.clientX <= parentRect.right && e.clientY >= parentRect.top && e.clientY <= parentRect.bottom) {
				xBottom = e.clientX - offsetX - parentRect.left;
				yBottom = e.clientY - offsetY - parentRect.top;
			}
		}
	}

	function handleDragTop(e) {
		if ((e.clientX !== 0 || e.clientY !== 0) && containerTop) {
			const parentRect = containerTop.getBoundingClientRect();

			if (e.clientX >= parentRect.left && e.clientX <= parentRect.right && e.clientY >= parentRect.top && e.clientY <= parentRect.bottom) {
				xTop = e.clientX - offsetX - parentRect.left;
				yTop = e.clientY - offsetY - parentRect.top;
			}
		}
	}

	function handleDragEndBottom() {
		const moved = Math.abs(xBottom - startXBottom) > 5 || Math.abs(yBottom - startYBottom) > 5;

		if (!moved) openBottom = !openBottom;
	}

	function handleDragEndTop() {
		const moved = Math.abs(xTop - startXTop) > 5 || Math.abs(yTop - startYTop) > 5;

		if (!moved) openTop = !openTop;
	}

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Tile(node, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						$$events: { click: () => openBottom = !openBottom },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Direction: bottom (default)');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => anchorBottom = $$value, () => anchorBottom);

			var node_1 = $.sibling(div_1, 2);

			FloatingPortal(node_1, {
				get anchor() {
					return anchorBottom;
				},

				get open() {
					return openBottom;
				},
				direction: 'bottom',
				children: ($$anchor, $$slotProps) => {
					Tile($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Content');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.bind_this(div, ($$value) => containerBottom = $$value, () => containerBottom);

			var div_2 = $.sibling(div, 2);
			var div_3 = $.child(div_2);
			var node_2 = $.child(div_3);

			Tile(node_2, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						$$events: { click: () => openTop = !openTop },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Direction: top');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.bind_this(div_3, ($$value) => anchorTop = $$value, () => anchorTop);

			var node_3 = $.sibling(div_3, 2);

			FloatingPortal(node_3, {
				get anchor() {
					return anchorTop;
				},

				get open() {
					return openTop;
				},
				direction: 'top',
				children: ($$anchor, $$slotProps) => {
					Tile($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Content');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.bind_this(div_2, ($$value) => containerTop = $$value, () => containerTop);

			$.template_effect(() => {
				$.set_style(div_1, `position: absolute; left: ${xBottom ?? ''}px; top: ${yBottom ?? ''}px; cursor: move; user-select: none;`);
				$.set_style(div_3, `position: absolute; left: ${xTop ?? ''}px; top: ${yTop ?? ''}px; cursor: move; user-select: none;`);
			});

			$.event('dragstart', div_1, handleDragStartBottom);
			$.event('drag', div_1, handleDragBottom);
			$.event('dragend', div_1, handleDragEndBottom);

			$.event('keydown', div_1, (e) => {
				if (e.key === "Enter") openBottom = !openBottom;
			});

			$.event('dragstart', div_3, handleDragStartTop);
			$.event('drag', div_3, handleDragTop);
			$.event('dragend', div_3, handleDragEndTop);

			$.event('keydown', div_3, (e) => {
				if (e.key === "Enter") openTop = !openTop;
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}