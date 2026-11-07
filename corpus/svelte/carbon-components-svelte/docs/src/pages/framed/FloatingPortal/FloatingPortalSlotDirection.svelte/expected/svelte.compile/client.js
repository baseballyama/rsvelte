import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, FloatingPortal, Stack, Tag, Tile } from "carbon-components-svelte";

var root = $.from_html(`Actual direction: <!>`, 1);
var root_1 = $.from_html(`<div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true" title="Drag to move, click to toggle"><!></div></div> <!>`, 1);

export default function FloatingPortalSlotDirection($$anchor, $$props) {
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

		if (!moved) open = !open;
	}

	var fragment = root_1();
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
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const direction = $.derived(() => $$slotProps.direction);

				Tile($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Stack($$anchor, {
							orientation: 'horizontal',
							align: 'center',
							gap: 2,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_4 = root();
								var node_2 = $.sibling($.first_child(fragment_4));

								Tag(node_2, {
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(direction)));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}
		}
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