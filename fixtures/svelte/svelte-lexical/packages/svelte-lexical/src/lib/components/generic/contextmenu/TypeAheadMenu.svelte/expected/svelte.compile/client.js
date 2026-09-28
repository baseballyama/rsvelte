import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

export default function TypeAheadMenu($$anchor, $$props) {
	$.push($$props, true);

	let commandPriority = $.prop($$props, 'commandPriority', 3, COMMAND_PRIORITY_LOW),
		preselectFirstItem = $.prop($$props, 'preselectFirstItem', 3, true),
		ignoreEntityBoundary = $.prop($$props, 'ignoreEntityBoundary', 3, false);

	const editor = getEditor();

	function useDynamicPositioning(resolution, targetElement, onReposition, onVisibilityChange) {
		$.user_effect(() => {
			if (targetElement != null && resolution.value != null) {
				const rootElement = editor.getRootElement();
				const rootScrollParent = rootElement != null ? getScrollParent(rootElement, false) : document.body;
				let ticking = false;
				let previousIsInView = isTriggerVisibleInNearestScrollContainer(targetElement, rootScrollParent);

				const handleScroll = function () {
					if (!ticking) {
						window.requestAnimationFrame(function () {
							onReposition();
							ticking = false;
						});

						ticking = true;
					}

					const isInView = isTriggerVisibleInNearestScrollContainer(targetElement, rootScrollParent);

					if (isInView !== previousIsInView) {
						previousIsInView = isInView;

						if (onVisibilityChange != null) {
							onVisibilityChange(isInView);
						}
					}
				};

				const resizeObserver = new ResizeObserver(onReposition);

				window.addEventListener('resize', onReposition);
				document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
				resizeObserver.observe(targetElement);

				return () => {
					resizeObserver.unobserve(targetElement);
					window.removeEventListener('resize', onReposition);
					document.removeEventListener('scroll', handleScroll, true);
				};
			}
		});
	}

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

		$.user_effect(() => {
			const rootElement = editor.getRootElement();

			if (resolution.value !== null) {
				positionMenu();
			}

			return () => {
				if (rootElement !== null) {
					rootElement.removeAttribute('aria-controls');
				}

				const containerDiv = anchorElementRef;

				if (containerDiv !== null && containerDiv.isConnected) {
					containerDiv.remove();
					containerDiv.removeAttribute('id');
				}
			};
		});

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

	let resolution = $.proxy({ value: null });
	const anchorElementRef = useMenuAnchorRef(resolution, $$props.anchorClassName, $$props.parent);

	const closeTypeahead = () => {
		resolution.value = null;

		if ($$props.onClose != null && resolution.value !== null) {
			$$props.onClose();
		}
	};

	const openTypeahead = (res) => {
		resolution.value = res;

		if ($$props.onOpen != null && resolution.value === null) {
			$$props.onOpen(res);
		}
	};

	$.user_effect(() => {
		const updateListener = () => {
			editor.getEditorState().read(() => {
				// Check if editor is in read-only mode
				if (!editor.isEditable()) {
					closeTypeahead();

					return;
				}

				const editorWindow = editor._window || window;
				const range = editorWindow.document.createRange();
				const selection = getSelection();
				const text = getQueryTextForSearch(editor);

				if (!isRangeSelection(selection) || !selection.isCollapsed() || text === null || range === null) {
					closeTypeahead();

					return;
				}

				const match = $$props.triggerFn(text, editor);

				$$props.onQueryChange(match ? match.matchingString : null);

				if (match !== null && (ignoreEntityBoundary() || !isSelectionOnEntityBoundary(editor, match.leadOffset))) {
					const isRangePositioned = tryToPositionRange(match.leadOffset, range, editorWindow);

					if (isRangePositioned !== null) {
						openTypeahead({ getRect: () => range.getBoundingClientRect(), match });

						return;
					}
				}

				closeTypeahead();
			});
		};

		const removeUpdateListener = editor.registerUpdateListener(updateListener);

		return () => {
			removeUpdateListener();
		};
	});

	$.user_effect(() => editor.registerEditableListener((isEditable) => {
		if (!isEditable) {
			closeTypeahead();
		}
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ContextMenu($$anchor, {
				close: closeTypeahead,
				get resolution() {
					return resolution;
				},

				get editor() {
					return editor;
				},

				get anchorElementRef() {
					return anchorElementRef;
				},

				get options() {
					return $$props.options;
				},

				get menuRenderFn() {
					return $$props.menuRenderFn;
				},
				shouldSplitNodeWithQuery: true,
				get onSelectOption() {
					return $$props.onSelectOption;
				},

				get commandPriority() {
					return commandPriority();
				},

				get preselectFirstItem() {
					return preselectFirstItem();
				}
			});
		};

		$.if(node, ($$render) => {
			if (!(resolution.value === null || editor === null || anchorElementRef === null)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}