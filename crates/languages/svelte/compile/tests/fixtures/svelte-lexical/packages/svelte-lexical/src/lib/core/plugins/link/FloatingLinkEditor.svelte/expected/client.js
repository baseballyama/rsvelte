import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './FloatingLinkEditor.css';

import {
	$isLinkNode as isLinkNode,
	$isAutoLinkNode as isAutoLinkNode,
	TOGGLE_LINK_COMMAND,
	$createLinkNode as createLinkNode
} from '@lexical/link';

import { mergeRegister, $findMatchingParent as findMatchingParent } from '@lexical/utils';

import {
	$getSelection as getSelection,
	$isRangeSelection as isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	KEY_ESCAPE_COMMAND,
	SELECTION_CHANGE_COMMAND,
	getDOMSelection,
	$isNodeSelection as isNodeSelection
} from 'lexical';

import { onMount } from 'svelte';
import getSelectedNode from '../../../components/toolbar/getSelectionInfo.js';
import { setFloatingElemPositionForLinkEditor } from './setFloatingElemPositionForLinkEditor.js';
import { sanitizeUrl } from './url.js';

var root = $.from_html(`<input class="link-input"/> <div><div class="link-cancel" role="button"></div> <div class="link-confirm" role="button"></div></div>`, 1);
var root_1 = $.from_html(`<div class="link-view"><a target="_blank" rel="noopener noreferrer"> </a>  <div class="link-edit" role="button"></div> <div class="link-trash" role="button"></div></div>`);
var root_2 = $.from_html(`<div class="link-editor"><!></div>`);

export default function FloatingLinkEditor($$anchor, $$props) {
	$.push($$props, true);

	let editorRef;
	let inputRef = $.state(void 0);
	let linkUrl = $.state('');
	let editedLinkUrl = $.state('');

	let isLink = $.prop($$props, 'isLink', 7),
		isEditMode = $.prop($$props, 'isEditMode', 15, false);

	let lastSelection = null;

	function preventDefault(event) {
		event.preventDefault();
	}

	$.user_pre_effect(() => {
		if (isEditMode() && $.get(inputRef)) {
			$.get(inputRef).focus();
		}
	});

	$.user_pre_effect(() => {
		if ($$props.anchorElem && editorRef) {
			$$props.anchorElem.appendChild(editorRef);
		}
	});

	onMount(() => {
		const scrollerElem = $$props.anchorElem.parentElement;

		const update = () => {
			$$props.editor.getEditorState().read(() => {
				updateLinkEditor();
			});
		};

		window.addEventListener('resize', update);

		if (scrollerElem) {
			scrollerElem.addEventListener('scroll', update);
		}

		return mergeRegister(
			() => {
				window.removeEventListener('resize', update);

				if (scrollerElem) {
					scrollerElem.removeEventListener('scroll', update);
				}
			},
			$$props.editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateLinkEditor();
				});
			}),
			$$props.editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateLinkEditor();

					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			$$props.editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				() => {
					if (isLink()) {
						isLink(false);

						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_HIGH
			)
		);
	});

	$.user_effect(() => {
		const editorElement = editorRef;

		if (editorElement === null) {
			return;
		}

		const handleBlur = (event) => {
			if (!editorElement.contains(event.relatedTarget) && isLink() && isEditMode()) {
				// isLink = false; // goes into a race with code that launches link editor
				isEditMode(false);
			}
		};

		editorElement.addEventListener('focusout', handleBlur);

		return () => {
			editorElement.removeEventListener('focusout', handleBlur);
		};
	});

	function updateLinkEditor() {
		const selection = getSelection();

		if (isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const linkParent = findMatchingParent(node, isLinkNode);

			if (isLinkNode(linkParent)) {
				$.set(linkUrl, linkParent.getURL(), true);
			} else if (isLinkNode(node)) {
				$.set(linkUrl, node.getURL(), true);
			} else {
				$.set(linkUrl, '');
			}

			if (isEditMode()) {
				$.set(editedLinkUrl, $.get(linkUrl), true);
			}
		} else if (isNodeSelection(selection)) {
			const nodes = selection.getNodes();

			if (nodes.length > 0) {
				const node = nodes[0];
				const parent = node.getParent();

				if (isLinkNode(parent)) {
					$.set(linkUrl, parent.getURL(), true);
				} else if (isLinkNode(node)) {
					$.set(linkUrl, node.getURL(), true);
				} else {
					$.set(linkUrl, '');
				}
			}

			if (isEditMode()) {
				$.set(editedLinkUrl, $.get(linkUrl), true);
			}
		}

		const editorElem = editorRef;
		const nativeSelection = getDOMSelection($$props.editor._window);
		const activeElement = document.activeElement;

		if (editorElem === null) {
			return;
		}

		const rootElement = $$props.editor.getRootElement();

		if (selection !== null && rootElement !== null && $$props.editor.isEditable()) {
			let domRect;

			if (isNodeSelection(selection)) {
				const nodes = selection.getNodes();

				if (nodes.length > 0) {
					const element = $$props.editor.getElementByKey(nodes[0].getKey());

					if (element) {
						domRect = element.getBoundingClientRect();
					}
				}
			} else if (nativeSelection !== null && rootElement.contains(nativeSelection.anchorNode)) {
				domRect = nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
			}

			if (domRect) {
				domRect.y += 40;
				setFloatingElemPositionForLinkEditor(domRect, editorElem, $$props.anchorElem);
			}

			lastSelection = selection;
		} else if (!activeElement || activeElement.className !== 'link-input') {
			if (rootElement !== null) {
				setFloatingElemPositionForLinkEditor(null, editorElem, $$props.anchorElem);
			}

			lastSelection = null;
			isEditMode(false);
			$.set(linkUrl, '');
		}

		return true;
	}

	function monitorInputInteraction(event) {
		if (event.key === 'Enter') {
			handleLinkSubmission(event);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			isEditMode(false);
		}
	}

	function handleLinkSubmission(event) {
		event.preventDefault();

		if (lastSelection !== null) {
			if ($.get(linkUrl) !== '') {
				$$props.editor.update(() => {
					$$props.editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl($.get(editedLinkUrl)));

					const selection = getSelection();

					if (isRangeSelection(selection)) {
						const parent = getSelectedNode(selection).getParent();

						if (isAutoLinkNode(parent)) {
							const linkNode = createLinkNode(parent.getURL(), {
								rel: parent.__rel,
								target: parent.__target,
								title: parent.__title
							});

							parent.replace(linkNode, true);
						}
					}
				});
			}

			isEditMode(false);
		}
	}

	var div = root_2();
	var node_1 = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var input = $.first_child(fragment_1);

					$.remove_input_defaults(input);
					$.bind_this(input, ($$value) => $.set(inputRef, $$value), () => $.get(inputRef));

					var div_1 = $.sibling(input, 2);
					var div_2 = $.child(div_1);

					$.set_attribute(div_2, 'tabindex', 0);

					var div_3 = $.sibling(div_2, 2);

					$.set_attribute(div_3, 'tabindex', 0);
					$.reset(div_1);

					$.delegated('keydown', input, (event) => {
						monitorInputInteraction(event);
					});

					$.bind_value(input, () => $.get(editedLinkUrl), ($$value) => $.set(editedLinkUrl, $$value));
					$.delegated('mousedown', div_2, preventDefault);

					$.delegated('click', div_2, () => {
						isEditMode(false);
					});

					$.delegated('mousedown', div_3, preventDefault);
					$.delegated('click', div_3, handleLinkSubmission);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var div_4 = root_1();
					var a = $.child(div_4);
					var text = $.only_child(a, true);
					var div_5 = $.sibling(a, 2);

					$.set_attribute(div_5, 'tabindex', 0);

					var div_6 = $.sibling(div_5, 2);

					$.set_attribute(div_6, 'tabindex', 0);
					$.reset(div_4);

					$.template_effect(
						($0) => {
							$.set_attribute(a, 'href', $0);
							$.set_text(text, $.get(linkUrl));
						},
						[() => sanitizeUrl($.get(linkUrl))]
					);

					$.delegated('mousedown', div_5, preventDefault);

					$.delegated('click', div_5, (event) => {
						event.preventDefault();
						$.set(editedLinkUrl, $.get(linkUrl), true);
						isEditMode(true);
					});

					$.delegated('mousedown', div_6, preventDefault);

					$.delegated('click', div_6, () => {
						$$props.editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
					});

					$.append($$anchor, div_4);
				};

				$.if(node_2, ($$render) => {
					if (isEditMode()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (isLink()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => editorRef = $$value, () => editorRef);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'mousedown', 'click']);