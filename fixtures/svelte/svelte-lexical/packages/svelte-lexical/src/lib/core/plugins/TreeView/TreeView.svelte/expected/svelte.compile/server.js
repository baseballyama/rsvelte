import * as $ from 'svelte/internal/server';
import { $generateHtmlFromNodes as generateHtmlFromNodes } from '@lexical/html';
import { $isLinkNode as isLinkNode, LinkNode } from '@lexical/link';
import { $isMarkNode as isMarkNode } from '@lexical/mark';
import { mergeRegister } from '@lexical/utils';

import {
	$getRoot as getRoot,
	$getSelection as getSelection,
	$isElementNode as isElementNode,
	$isRangeSelection as isRangeSelection,
	$isTextNode as isTextNode,
	$isNodeSelection as isNodeSelection,
	$isParagraphNode as isParagraphNode
} from 'lexical';

import { $isTableSelection as isTableSelection } from '@lexical/table';
import { onMount } from 'svelte';
import { getEditor } from '../../composerContext.js';
import CommandsLog from './CommandsLog.svelte';

export default function TreeView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const NON_SINGLE_WIDTH_CHARS_REPLACEMENT = Object.freeze({ '\t': '\\t', '\n': '\\n' });
		const NON_SINGLE_WIDTH_CHARS_REGEX = new RegExp(Object.keys(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).join('|'), 'g');

		const SYMBOLS = Object.freeze({
			ancestorHasNextSibling: '|',
			ancestorIsLastChild: ' ',
			hasNextSibling: '├',
			isLastChild: '└',
			selectedChar: '^',
			selectedLine: '>'
		});

		let {
			treeTypeButtonClassName,
			timeTravelButtonClassName,
			timeTravelPanelButtonClassName,
			timeTravelPanelClassName,
			timeTravelPanelSliderClassName,
			viewClassName
		} = $$props;

		const editor = getEditor();
		let timeStampedEditorStates = [];
		let content = '';
		let timeTravelEnabled = false;
		let showExportDOM = false;
		let playingIndexRef = 0;
		let treeElementRef = null;
		let inputRef = null;
		let isPlaying = false;
		let isLimited = false;
		let showLimited = false;
		let lastEditorStateRef = null;
		let commandsLog = [];

		function generateTree(editorState) {
			const treeText = generateContent(editor, commandsLog, showExportDOM);

			content = treeText;

			if (!timeTravelEnabled) {
				timeStampedEditorStates = [...timeStampedEditorStates, [Date.now(), editorState]];
			}
		}

		let timeoutId;

		function play() {
			const currentIndex = playingIndexRef;

			if (currentIndex === totalEditorStates() - 1) {
				isPlaying = false;

				return;
			}

			const currentTime = timeStampedEditorStates[currentIndex][0];
			const nextTime = timeStampedEditorStates[currentIndex + 1][0];
			const timeDiff = nextTime - currentTime;

			timeoutId = setTimeout(
				() => {
					playingIndexRef++;

					const index = playingIndexRef;
					const input = inputRef;

					if (input !== null) {
						input.value = String(index);
					}

					editor.setEditorState(timeStampedEditorStates[index][1]);
					play();
				},
				timeDiff
			);
		}

		onMount(() => {
			const element = treeElementRef;

			if (element !== null) {
				// @ts-ignore Internal field
				element.__lexicalEditor = editor;
			}

			return mergeRegister(
				// @ts-ignore Internal field
				() => treeElementRef.__lexicalEditor = null,
				editor.registerUpdateListener(({ editorState }) => {
					if (!showLimited && editorState._nodeMap.size > 1000) {
						lastEditorStateRef = editorState;
						isLimited = true;

						if (!showLimited) {
							return;
						}
					}

					generateTree(editorState);
				}),
				editor.registerEditableListener(() => {
					const treeText = generateContent(editor, commandsLog, showExportDOM);

					content = treeText;
				})
			);
		});

		function printRangeSelection(selection) {
			let res = '';
			const formatText = printFormatProperties(selection);

			res += `: range ${formatText !== '' ? `{ ${formatText} }` : ''} ${selection.style !== '' ? `{ style: ${selection.style} } ` : ''}`;

			const anchor = selection.anchor;
			const focus = selection.focus;
			const anchorOffset = anchor.offset;
			const focusOffset = focus.offset;

			res += `\n  ├ anchor { key: ${anchor.key}, offset: ${anchorOffset === null ? 'null' : anchorOffset}, type: ${anchor.type} }`;
			res += `\n  └ focus { key: ${focus.key}, offset: ${focusOffset === null ? 'null' : focusOffset}, type: ${focus.type} }`;

			return res;
		}

		function printNodeSelection(selection) {
			if (!isNodeSelection(selection)) return '';

			return `: node\n  └ [${Array.from(selection._nodes).join(', ')}]`;
		}

		function printTableSelection(selection) {
			return `: table\n  └ { table: ${selection.tableKey}, anchorCell: ${selection.anchor.key}, focusCell: ${selection.focus.key} }`;
		}

		function generateContent(editor, commandsLog, exportDOM) {
			const editorState = editor.getEditorState();
			const editorConfig = editor._config;
			const compositionKey = editor._compositionKey;
			const editable = editor._editable;

			if (exportDOM) {
				let htmlString = '';

				editorState.read(() => {
					htmlString = printPrettyHTML(generateHtmlFromNodes(editor));
				});

				return htmlString;
			}

			let res = ' root\n';

			const selectionString = editorState.read(() => {
				const selection = getSelection();

				visitTree(getRoot(), (node, indent) => {
					const nodeKey = node.getKey();
					const nodeKeyDisplay = `(${nodeKey})`;
					const typeDisplay = node.getType() || '';
					const isSelected = node.isSelected();

					res += `${isSelected ? SYMBOLS.selectedLine : ' '} ${indent.join(' ')} ${nodeKeyDisplay} ${typeDisplay} ${printNode(node)}\n`;

					res += printSelectedCharsLine({
						indent,
						isSelected,
						node,
						nodeKeyDisplay,
						selection,
						typeDisplay
					});
				});

				return selection === null
					? ': null'
					: isRangeSelection(selection)
						? printRangeSelection(selection)
						: isTableSelection(selection)
							? printTableSelection(selection)
							: printNodeSelection(selection);
			});

			res += '\n selection' + selectionString;
			res += '\n\n commands:';

			if (commandsLog && commandsLog.length) {
				for (const { index, type, payload } of commandsLog) {
					res += `\n  └ ${index}. { type: ${type}, payload: ${payload instanceof Event ? payload.constructor.name : payload} }`;
				}
			} else {
				res += '\n  └ None dispatched.';
			}

			res += '\n\n editor:';
			res += `\n  └ namespace ${editorConfig.namespace}`;

			if (compositionKey !== null) {
				res += `\n  └ compositionKey ${compositionKey}`;
			}

			res += `\n  └ editable ${String(editable)}`;

			return res;
		}

		function visitTree(currentNode, visitor, indent = []) {
			const childNodes = currentNode.getChildren();
			const childNodesLength = childNodes.length;

			childNodes.forEach((childNode, i) => {
				visitor(childNode, indent.concat(i === childNodesLength - 1 ? SYMBOLS.isLastChild : SYMBOLS.hasNextSibling));

				if (isElementNode(childNode)) {
					visitTree(childNode, visitor, indent.concat(i === childNodesLength - 1
						? SYMBOLS.ancestorIsLastChild
						: SYMBOLS.ancestorHasNextSibling));
				}
			});
		}

		function normalize(text) {
			return Object.entries(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).reduce((acc, [key, value]) => acc.replace(new RegExp(key, 'g'), String(value)), text);
		}

		// TODO Pass via props to allow customizability
		function printNode(node) {
			if (isTextNode(node)) {
				const text = node.getTextContent();
				const title = text.length === 0 ? '(empty)' : `"${normalize(text)}"`;
				const properties = printAllTextNodeProperties(node);

				return [title, properties.length !== 0 ? `{ ${properties} }` : null].filter(Boolean).join(' ').trim();
			} else if (isLinkNode(node)) {
				const link = node.getURL();
				const title = link.length === 0 ? '(empty)' : `"${normalize(link)}"`;
				const properties = printAllLinkNodeProperties(node);

				return [title, properties.length !== 0 ? `{ ${properties} }` : null].filter(Boolean).join(' ').trim();
			} else if (isMarkNode(node)) {
				return `ids: [ ${node.getIDs().join(', ')} ]`;
			} else if (isParagraphNode(node)) {
				const formatText = printTextFormatProperties(node);

				return formatText !== '' ? `{ ${formatText} }` : '';
			} else {
				return '';
			}
		}

		const FORMAT_PREDICATES = [
			(node) => node.hasFormat('bold') && 'Bold',
			(node) => node.hasFormat('code') && 'Code',
			(node) => node.hasFormat('italic') && 'Italic',
			(node) => node.hasFormat('strikethrough') && 'Strikethrough',
			(node) => node.hasFormat('subscript') && 'Subscript',
			(node) => node.hasFormat('superscript') && 'Superscript',
			(node) => node.hasFormat('underline') && 'Underline'
		];

		const FORMAT_PREDICATES_PARAGRAPH = [
			(node) => node.hasTextFormat('bold') && 'Bold',
			(node) => node.hasTextFormat('code') && 'Code',
			(node) => node.hasTextFormat('italic') && 'Italic',
			(node) => node.hasTextFormat('strikethrough') && 'Strikethrough',
			(node) => node.hasTextFormat('subscript') && 'Subscript',
			(node) => node.hasTextFormat('superscript') && 'Superscript',
			(node) => node.hasTextFormat('underline') && 'Underline'
		];

		const DETAIL_PREDICATES = [
			(node) => node.isDirectionless() && 'Directionless',
			(node) => node.isUnmergeable() && 'Unmergeable'
		];

		const MODE_PREDICATES = [
			(node) => node.isToken() && 'Token',
			(node) => node.isSegmented() && 'Segmented'
		];

		function printAllTextNodeProperties(node) {
			return [
				printFormatProperties(node),
				printDetailProperties(node),
				printModeProperties(node),
				printStateProperties(node)
			].filter(Boolean).join(', ');
		}

		function printAllLinkNodeProperties(node) {
			return [
				printTargetProperties(node),
				printRelProperties(node),
				printTitleProperties(node),
				printStateProperties(node)
			].filter(Boolean).join(', ');
		}

		function printDetailProperties(nodeOrSelection) {
			let str = DETAIL_PREDICATES.map((predicate) => predicate(nodeOrSelection)).filter(Boolean).join(', ').toLocaleLowerCase();

			if (str !== '') {
				str = 'detail: ' + str;
			}

			return str;
		}

		function printModeProperties(nodeOrSelection) {
			let str = MODE_PREDICATES.map((predicate) => predicate(nodeOrSelection)).filter(Boolean).join(', ').toLocaleLowerCase();

			if (str !== '') {
				str = 'mode: ' + str;
			}

			return str;
		}

		function printTextFormatProperties(nodeOrSelection) {
			let str = FORMAT_PREDICATES_PARAGRAPH.map((predicate) => predicate(nodeOrSelection)).filter(Boolean).join(', ').toLocaleLowerCase();

			if (str !== '') {
				str = 'format: ' + str;
			}

			return str;
		}

		function printFormatProperties(nodeOrSelection) {
			let str = FORMAT_PREDICATES.map((predicate) => predicate(nodeOrSelection)).filter(Boolean).join(', ').toLocaleLowerCase();

			if (str !== '') {
				str = 'format: ' + str;
			}

			return str;
		}

		function printTargetProperties(node) {
			let str = node.getTarget();

			// TODO Fix nullish on LinkNode
			if (str != null) {
				str = 'target: ' + str;
			}

			return str;
		}

		function printRelProperties(node) {
			let str = node.getRel();

			// TODO Fix nullish on LinkNode
			if (str != null) {
				str = 'rel: ' + str;
			}

			return str;
		}

		function printTitleProperties(node) {
			let str = node.getTitle();

			// TODO Fix nullish on LinkNode
			if (str != null) {
				str = 'title: ' + str;
			}

			return str;
		}

		function printStateProperties(node) {
			if (!node.__state) {
				return false;
			}

			const states = [];

			for (const [stateType, value] of node.__state.knownState.entries()) {
				if (stateType.isEqual(value, stateType.defaultValue)) {
					continue;
				}

				const textValue = JSON.stringify(stateType.unparse(value));

				states.push(`[${stateType.key}: ${textValue}]`);
			}

			let str = states.join(',');

			if (str !== '') {
				str = 'state: ' + str;
			}

			return str;
		}

		function printSelectedCharsLine(
			{
				indent,
				isSelected,
				node,
				nodeKeyDisplay,
				selection,
				typeDisplay
			}
		) {
			// No selection or node is not selected.
			if (!isTextNode(node) || !isRangeSelection(selection) || !isSelected || isElementNode(node)) {
				return '';
			}

			// No selected characters.
			const anchor = selection.anchor;

			const focus = selection.focus;

			if (node.getTextContent() === '' || anchor.getNode() === selection.focus.getNode() && anchor.offset === focus.offset) {
				return '';
			}

			const [start, end] = getSelectionStartEnd(node, selection);

			if (start === end) {
				return '';
			}

			const selectionLastIndent = indent[indent.length - 1] === SYMBOLS.hasNextSibling
				? SYMBOLS.ancestorHasNextSibling
				: SYMBOLS.ancestorIsLastChild;

			const indentionChars = [...indent.slice(0, indent.length - 1), selectionLastIndent];
			const unselectedChars = Array(start + 1).fill(' ');
			const selectedChars = Array(end - start).fill(SYMBOLS.selectedChar);
			const paddingLength = typeDisplay.length + 2; // 1 for the space after + 1 for the double quote.
			const nodePrintSpaces = Array(nodeKeyDisplay.length + paddingLength).fill(' ');

			return [
				SYMBOLS.selectedLine,
				indentionChars.join(' '),
				[...nodePrintSpaces, ...unselectedChars, ...selectedChars].join('')
			].join(' ') + '\n';
		}

		function printPrettyHTML(str) {
			const div = document.createElement('div');

			div.innerHTML = str.trim();

			return prettifyHTML(div, 0).innerHTML;
		}

		function prettifyHTML(node, level) {
			const indentBefore = new Array(level++ + 1).join('  ');
			const indentAfter = new Array(level - 1).join('  ');
			let textNode;

			for (let i = 0; i < node.children.length; i++) {
				textNode = document.createTextNode('\n' + indentBefore);
				node.insertBefore(textNode, node.children[i]);
				prettifyHTML(node.children[i], level);

				if (node.lastElementChild === node.children[i]) {
					textNode = document.createTextNode('\n' + indentAfter);
					node.appendChild(textNode);
				}
			}

			return node;
		}

		function getSelectionStartEnd(node, selection) {
			const anchorAndFocus = selection.getStartEndPoints();

			if (isNodeSelection(selection) || anchorAndFocus === null) {
				return [-1, -1];
			}

			const [anchor, focus] = anchorAndFocus;
			const textContent = node.getTextContent();
			const textLength = textContent.length;
			let start = -1;
			let end = -1;

			// Only one node is being selected.
			if (anchor.type === 'text' && focus.type === 'text') {
				const anchorNode = anchor.getNode();
				const focusNode = focus.getNode();

				if (anchorNode === focusNode && node === anchorNode && anchor.offset !== focus.offset) {
					[start, end] = anchor.offset < focus.offset
						? [anchor.offset, focus.offset]
						: [focus.offset, anchor.offset];
				} else if (node === anchorNode) {
					[start, end] = anchorNode.isBefore(focusNode) ? [anchor.offset, textLength] : [0, anchor.offset];
				} else if (node === focusNode) {
					[start, end] = focusNode.isBefore(anchorNode) ? [focus.offset, textLength] : [0, focus.offset];
				} else {
					// Node is within selection but not the anchor nor focus.
					[start, end] = [0, textLength];
				}
			}

			// Account for non-single width characters.
			const numNonSingleWidthCharBeforeSelection = (textContent.slice(0, start).match(NON_SINGLE_WIDTH_CHARS_REGEX) || []).length;

			const numNonSingleWidthCharInSelection = (textContent.slice(start, end).match(NON_SINGLE_WIDTH_CHARS_REGEX) || []).length;

			return [
				start + numNonSingleWidthCharBeforeSelection,
				end + numNonSingleWidthCharBeforeSelection + numNonSingleWidthCharInSelection
			];
		}

		let totalEditorStates = $.derived(() => timeStampedEditorStates.length);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CommandsLog($$renderer, {
				get loggedCommands() {
					return commandsLog;
				},

				set loggedCommands($$value) {
					commandsLog = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div${$.attr_class($.clsx(viewClassName))}>`);

			if (!showLimited && isLimited) {
				$$renderer.push(`<!--[0--><div style="padding: 20px"><span style="margin-right: 20px">Detected large EditorState, this can impact debugging performance.</span> <button type="button" style="background: transparent; border: 1px solid white; color: white; cursor: pointer; padding: 5px;">Show full tree</button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!showLimited) {
				$$renderer.push(`<!--[0--><button${$.attr_class($.clsx(treeTypeButtonClassName))} type="button">${$.escape(showExportDOM ? 'Tree' : 'Export DOM')}</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!timeTravelEnabled && (showLimited || !isLimited) && totalEditorStates() > 2) {
				$$renderer.push(`<!--[0--><button${$.attr_class($.clsx(timeTravelButtonClassName))} type="button">Time Travel</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showLimited || !isLimited) {
				$$renderer.push(`<!--[0--><pre class="svelte-1i97yq6">${$.escape(content)}</pre>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (timeTravelEnabled && (showLimited || !isLimited)) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(timeTravelPanelClassName))}><button${$.attr_class($.clsx(timeTravelPanelButtonClassName))} type="button">${$.escape(isPlaying ? 'Pause' : 'Play')}</button> <input${$.attr_class($.clsx(timeTravelPanelSliderClassName))} type="range" min="1"${$.attr('max', totalEditorStates() - 1)}/> <button${$.attr_class($.clsx(timeTravelPanelButtonClassName))} type="button">Exit</button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}