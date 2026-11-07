import * as $ from 'svelte/internal/server';
import { Button, FloatingPortal, Stack, Tile } from "carbon-components-svelte";

export default function FloatingPortalDirection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				$$renderer.push(`<div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true"${$.attr_style(`position: absolute; left: ${$.stringify(xBottom)}px; top: ${$.stringify(yBottom)}px; cursor: move; user-select: none;`)} title="Drag to move, click to toggle">`);

				Tile($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Direction: bottom (default)`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				FloatingPortal($$renderer, {
					anchor: anchorBottom,
					open: openBottom,
					direction: 'bottom',
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

				$$renderer.push(`<!----></div> <div style="position: relative; min-height: 200px; min-width: 300px;"><div role="button" tabindex="0" draggable="true"${$.attr_style(`position: absolute; left: ${$.stringify(xTop)}px; top: ${$.stringify(yTop)}px; cursor: move; user-select: none;`)} title="Drag to move, click to toggle">`);

				Tile($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Direction: top`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				FloatingPortal($$renderer, {
					anchor: anchorTop,
					open: openTop,
					direction: 'top',
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

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}