import * as $ from 'svelte/internal/server';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection,
	COMMAND_PRIORITY_LOW
} from 'lexical';

import ContextMenu from './ContextMenu.svelte';

import {
	getQueryTextForSearch,
	getScrollParent,
	isSelectionOnEntityBoundary,
	isTriggerVisibleInNearestScrollContainer,
	setContainerDivAttributes,
	tryToPositionRange
} from './typeAheadMenuHelpers.js';

import { getEditor } from '$lib/core/composerContext.js';
import { CAN_USE_DOM } from '@lexical/utils';

export default function TypeAheadMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			options,
			onQueryChange,
			onSelectOption,
			onOpen,
			onClose,
			menuRenderFn,
			triggerFn,
			anchorClassName,
			commandPriority = COMMAND_PRIORITY_LOW,
			parent,
			preselectFirstItem = true,
			ignoreEntityBoundary = false
		} = $$props;

		const editor = getEditor();

		function useDynamicPositioning(resolution, targetElement, onReposition, onVisibilityChange) {}

		function useMenuAnchorRef(
			resolution,
			className,
			parent = CAN_USE_DOM ? document.body : undefined,
			shouldIncludePageYOffset__EXPERIMENTAL = true
		) {
			const initialAnchorElement = CAN_USE_DOM ? document.createElement('div') : null;
			const anchorElementRef = initialAnchorElement;

			const positionMenu = () => {
				if (anchorElementRef === null || parent === undefined) {
					return;
				}

				anchorElementRef.style.top = anchorElementRef.style.bottom;

				const rootElement = editor.getRootElement();
				const containerDiv = anchorElementRef;
				const menuEle = containerDiv.firstChild;

				if (rootElement !== null && resolution.value !== null) {
					const { left, top, width, height } = resolution.value.getRect();
					const anchorHeight = anchorElementRef.offsetHeight; // use to position under anchor

					containerDiv.style.top = `${top + anchorHeight + 3 + (shouldIncludePageYOffset__EXPERIMENTAL ? window.pageYOffset : 0)}px`;
					containerDiv.style.left = `${left + window.pageXOffset}px`;
					containerDiv.style.height = `${height}px`;
					containerDiv.style.width = `${width}px`;

					if (menuEle !== null) {
						menuEle.style.top = `${top}`;

						const menuRect = menuEle.getBoundingClientRect();
						const menuHeight = menuRect.height;
						const menuWidth = menuRect.width;
						const rootElementRect = rootElement.getBoundingClientRect();

						if (left + menuWidth > rootElementRect.right) {
							containerDiv.style.left = `${rootElementRect.right - menuWidth + window.pageXOffset}px`;
						}

						if ((top + menuHeight > window.innerHeight || top + menuHeight > rootElementRect.bottom) && top - rootElementRect.top > menuHeight + height) {
							containerDiv.style.top = `${top - menuHeight - height + (shouldIncludePageYOffset__EXPERIMENTAL ? window.pageYOffset : 0)}px`;
						}
					}

					if (!containerDiv.isConnected) {
						setContainerDivAttributes(containerDiv, className);
						parent.append(containerDiv);
					}

					containerDiv.setAttribute('id', 'typeahead-menu');
					rootElement.setAttribute('aria-controls', 'typeahead-menu');
				}
			};

			const onVisibilityChange = (isInView) => {
				if (resolution.value !== null) {
					if (!isInView) {
						resolution.value = null;
					}
				}
			};

			useDynamicPositioning(resolution, anchorElementRef, positionMenu, onVisibilityChange);

			// Append the context for the menu immediately
			if (initialAnchorElement != null && initialAnchorElement === anchorElementRef) {
				setContainerDivAttributes(initialAnchorElement, className);

				if (parent != null) {
					parent.append(initialAnchorElement);
				}
			}

			return anchorElementRef;
		}

		let resolution = { value: null };
		const anchorElementRef = useMenuAnchorRef(resolution, anchorClassName, parent);

		const closeTypeahead = () => {
			resolution.value = null;

			if (onClose != null && resolution.value !== null) {
				onClose();
			}
		};

		const openTypeahead = (res) => {
			resolution.value = res;

			if (onOpen != null && resolution.value === null) {
				onOpen(res);
			}
		};

		if (// Check if editor is in read-only mode
		!(resolution.value === null || editor === null || anchorElementRef === null)) {
			$$renderer.push('<!--[0-->');

			ContextMenu($$renderer, {
				close: closeTypeahead,
				resolution,
				editor,
				anchorElementRef,
				options,
				menuRenderFn,
				shouldSplitNodeWithQuery: true,
				onSelectOption,
				commandPriority,
				preselectFirstItem
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}