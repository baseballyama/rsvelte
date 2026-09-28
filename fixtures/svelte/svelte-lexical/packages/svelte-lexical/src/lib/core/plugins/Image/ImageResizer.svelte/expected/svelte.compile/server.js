import * as $ from 'svelte/internal/server';
import { calculateZoomLevel } from '@lexical/utils';

export default function ImageResizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			onResizeStart,
			onResizeEnd,
			buttonRef,
			imageRef,
			maxWidth,
			editor,
			showCaption,
			setShowCaption,
			captionsEnabled
		} = $$props;

		let controlWrapperRef = null;

		function clamp(value, min, max) {
			return Math.min(Math.max(value, min), max);
		}

		const Direction = { east: 1 << 0, north: 1 << 3, south: 1 << 1, west: 1 << 2 };
		const userSelect = { priority: '', value: 'default' };

		const positioningRef = {
			currentHeight: 0,
			currentWidth: 0,
			direction: 0,
			isResizing: false,
			ratio: 0,
			startHeight: 0,
			startWidth: 0,
			startX: 0,
			startY: 0
		};

		const editorRootElement = editor.getRootElement();

		// Find max width, accounting for editor padding.
		const maxWidthContainer = maxWidth
			? maxWidth
			: editorRootElement !== null
				? editorRootElement.getBoundingClientRect().width - 20
				: 100;

		const maxHeightContainer = editorRootElement !== null
			? editorRootElement.getBoundingClientRect().height - 20
			: 100;

		const minWidth = 100;
		const minHeight = 100;

		const setStartCursor = (direction) => {
			const ew = direction === Direction.east || direction === Direction.west;
			const ns = direction === Direction.north || direction === Direction.south;
			const nwse = direction & Direction.north && direction & Direction.west || direction & Direction.south && direction & Direction.east;
			const cursorDir = ew ? 'ew' : ns ? 'ns' : nwse ? 'nwse' : 'nesw';

			if (editorRootElement !== null) {
				editorRootElement.style.setProperty('cursor', `${cursorDir}-resize`, 'important');
			}

			if (document.body !== null) {
				document.body.style.setProperty('cursor', `${cursorDir}-resize`, 'important');
				userSelect.value = document.body.style.getPropertyValue('-webkit-user-select');
				userSelect.priority = document.body.style.getPropertyPriority('-webkit-user-select');
				document.body.style.setProperty('-webkit-user-select', `none`, 'important');
			}
		};

		const setEndCursor = () => {
			if (editorRootElement !== null) {
				editorRootElement.style.setProperty('cursor', 'default');
			}

			if (document.body !== null) {
				document.body.style.setProperty('cursor', 'default');
				document.body.style.setProperty('-webkit-user-select', userSelect.value, userSelect.priority);
			}
		};

		const handlePointerDown = (event, direction) => {
			if (!editor.isEditable()) {
				return;
			}

			const image = imageRef;
			const controlWrapper = controlWrapperRef;

			if (image !== null && controlWrapper !== null) {
				event.preventDefault();

				const { width, height } = image.getBoundingClientRect();
				const zoom = calculateZoomLevel(image);
				const positioning = positioningRef;

				positioning.startWidth = width;
				positioning.startHeight = height;
				positioning.ratio = width / height;
				positioning.currentWidth = width;
				positioning.currentHeight = height;
				positioning.startX = event.clientX / zoom;
				positioning.startY = event.clientY / zoom;
				positioning.isResizing = true;
				positioning.direction = direction;
				setStartCursor(direction);
				onResizeStart();
				controlWrapper.classList.add('image-control-wrapper--resizing');
				image.style.height = `${height}px`;
				image.style.width = `${width}px`;
				document.addEventListener('pointermove', handlePointerMove);
				document.addEventListener('pointerup', handlePointerUp);
			}
		};

		const handlePointerMove = (event) => {
			const image = imageRef;
			const positioning = positioningRef;
			const isHorizontal = positioning.direction & (Direction.east | Direction.west);
			const isVertical = positioning.direction & (Direction.south | Direction.north);

			if (image !== null && positioning.isResizing) {
				const zoom = calculateZoomLevel(image);

				// Corner cursor
				if (isHorizontal && isVertical) {
					let diff = Math.floor(positioning.startX - event.clientX / zoom);

					diff = positioning.direction & Direction.east ? -diff : diff;

					const width = clamp(positioning.startWidth + diff, minWidth, maxWidthContainer);
					const height = width / positioning.ratio;

					image.style.width = `${width}px`;
					image.style.height = `${height}px`;
					positioning.currentHeight = height;
					positioning.currentWidth = width;
				} else if (isVertical) {
					let diff = Math.floor(positioning.startY - event.clientY / zoom);

					diff = positioning.direction & Direction.south ? -diff : diff;

					const height = clamp(positioning.startHeight + diff, minHeight, maxHeightContainer);

					image.style.height = `${height}px`;
					positioning.currentHeight = height;
				} else {
					let diff = Math.floor(positioning.startX - event.clientX / zoom);

					diff = positioning.direction & Direction.east ? -diff : diff;

					const width = clamp(positioning.startWidth + diff, minWidth, maxWidthContainer);

					image.style.width = `${width}px`;
					positioning.currentWidth = width;
				}
			}
		};

		const handlePointerUp = () => {
			const image = imageRef;
			const positioning = positioningRef;
			const controlWrapper = controlWrapperRef;

			if (image !== null && controlWrapper !== null && positioning.isResizing) {
				const width = positioning.currentWidth;
				const height = positioning.currentHeight;

				positioning.startWidth = 0;
				positioning.startHeight = 0;
				positioning.ratio = 0;
				positioning.startX = 0;
				positioning.startY = 0;
				positioning.currentWidth = 0;
				positioning.currentHeight = 0;
				positioning.isResizing = false;
				controlWrapper.classList.remove('image-control-wrapper--resizing');
				setEndCursor();
				onResizeEnd(width, height);
				document.removeEventListener('pointermove', handlePointerMove);
				document.removeEventListener('pointerup', handlePointerUp);
			}
		};

		$$renderer.push(`<div>`);

		if (!showCaption && captionsEnabled) {
			$$renderer.push(`<!--[0--><button type="button" class="image-caption-button">Add Caption</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="image-resizer image-resizer-n" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-ne" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-e" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-se" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-s" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-sw" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-w" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-nw" role="button" tabindex="-1"></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}