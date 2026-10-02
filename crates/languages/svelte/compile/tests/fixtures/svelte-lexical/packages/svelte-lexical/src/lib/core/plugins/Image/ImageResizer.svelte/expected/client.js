import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { calculateZoomLevel } from '@lexical/utils';

var root = $.from_html(`<button type="button" class="image-caption-button">Add Caption</button>`);
var root_1 = $.from_html(`<div><!> <div class="image-resizer image-resizer-n" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-ne" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-e" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-se" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-s" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-sw" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-w" role="button" tabindex="-1"></div> <div class="image-resizer image-resizer-nw" role="button" tabindex="-1"></div></div>`);

export default function ImageResizer($$anchor, $$props) {
	$.push($$props, true);

	const $buttonRef = () => $.store_get($$props.buttonRef, '$buttonRef', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let controlWrapperRef = $.state(null);

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

	const editorRootElement = $$props.editor.getRootElement();

	// Find max width, accounting for editor padding.
	const maxWidthContainer = $$props.maxWidth
		? $$props.maxWidth
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
		if (!$$props.editor.isEditable()) {
			return;
		}

		const image = $$props.imageRef;
		const controlWrapper = $.get(controlWrapperRef);

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
			$$props.onResizeStart();
			controlWrapper.classList.add('image-control-wrapper--resizing');
			image.style.height = `${height}px`;
			image.style.width = `${width}px`;
			document.addEventListener('pointermove', handlePointerMove);
			document.addEventListener('pointerup', handlePointerUp);
		}
	};

	const handlePointerMove = (event) => {
		const image = $$props.imageRef;
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
		const image = $$props.imageRef;
		const positioning = positioningRef;
		const controlWrapper = $.get(controlWrapperRef);

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
			$$props.onResizeEnd(width, height);
			document.removeEventListener('pointermove', handlePointerMove);
			document.removeEventListener('pointerup', handlePointerUp);
		}
	};

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.bind_this(button, ($$value) => $.store_set($$props.buttonRef, $$value), () => $buttonRef());

			$.delegated('click', button, () => {
				$$props.setShowCaption(!$$props.showCaption);
			});

			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (!$$props.showCaption && $$props.captionsEnabled) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.sibling(div_7, 2);

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(controlWrapperRef, $$value), () => $.get(controlWrapperRef));

	$.delegated('pointerdown', div_1, (event) => {
		handlePointerDown(event, Direction.north);
	});

	$.delegated('pointerdown', div_2, (event) => {
		handlePointerDown(event, Direction.north | Direction.east);
	});

	$.delegated('pointerdown', div_3, (event) => {
		handlePointerDown(event, Direction.east);
	});

	$.delegated('pointerdown', div_4, (event) => {
		handlePointerDown(event, Direction.south | Direction.east);
	});

	$.delegated('pointerdown', div_5, (event) => {
		handlePointerDown(event, Direction.south);
	});

	$.delegated('pointerdown', div_6, (event) => {
		handlePointerDown(event, Direction.south | Direction.west);
	});

	$.delegated('pointerdown', div_7, (event) => {
		handlePointerDown(event, Direction.west);
	});

	$.delegated('pointerdown', div_8, (event) => {
		handlePointerDown(event, Direction.north | Direction.west);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'pointerdown']);