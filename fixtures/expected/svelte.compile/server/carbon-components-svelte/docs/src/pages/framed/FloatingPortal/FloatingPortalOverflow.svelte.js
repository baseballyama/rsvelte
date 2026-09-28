import * as $ from 'svelte/internal/server';
import { Button, FloatingPortal, Stack, Tile } from "carbon-components-svelte";

export default function FloatingPortalOverflow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Stack($$renderer, {
			gap: 4,
			style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem',
			children: ($$renderer) => {
				$$renderer.push(`<div>This container has hidden overflow.</div> <div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true"${$.attr_style(`position: absolute; left: ${$.stringify(x)}px; top: ${$.stringify(y)}px; cursor: move; user-select: none;`)} title="Drag to move, click to toggle">`);

				Tile($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle floating content`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FloatingPortal($$renderer, {
			anchor,
			open,
			children: ($$renderer) => {
				Tile($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}