import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	$createAutoLinkNode as createAutoLinkNode,
	$isAutoLinkNode as isAutoLinkNode,
	$isLinkNode as isLinkNode,
	AutoLinkNode,
	TOGGLE_LINK_COMMAND
} from '@lexical/link';

import { mergeRegister } from '@lexical/utils';

import {
	$createTextNode as createTextNode,
	$isElementNode as isElementNode,
	$isLineBreakNode as isLineBreakNode,
	$isTextNode as isTextNode,
	$isRangeSelection as isRangeSelection,
	$isNodeSelection as isNodeSelection,
	$getSelection as getSelection,
	COMMAND_PRIORITY_LOW,
	TextNode
} from 'lexical';

import { getEditor } from '../../composerContext.js';
import { onMount } from 'svelte';

export default function AutoLinkPluginCore($$anchor, $$props) {
	$.push($$props, true);

	function findFirstMatch(text, matchers) {
		for (let i = 0; i < matchers.length; i++) {
			const match = matchers[i](text);

			if (match) {
				return match;
			}
		}

		return null;
	}

	const PUNCTUATION_OR_SPACE = /[.,;\s]/;

	function isSeparator(char) {
		return PUNCTUATION_OR_SPACE.test(char);
	}

	function endsWithSeparator(textContent) {
		return isSeparator(textContent[textContent.length - 1]);
	}

	function startsWithSeparator(textContent) {
		return isSeparator(textContent[0]);
	}

	/**
	 * Check if the text content starts with a fullstop followed by a top-level domain.
	 * Meaning if the text content can be a beginning of a top level domain.
	 * @param textContent
	 * @param isEmail
	 * @returns boolean
	 */
	function startsWithTLD(textContent, isEmail) {
		if (isEmail) {
			return (/^\.[a-zA-Z]{2,}/).test(textContent);
		} else {
			return (/^\.[a-zA-Z0-9]{1,}/).test(textContent);
		}
	}

	function isPreviousNodeValid(node) {
		let previousNode = node.getPreviousSibling();

		if (isElementNode(previousNode)) {
			previousNode = previousNode.getLastDescendant();
		}

		return previousNode === null || isLineBreakNode(previousNode) || isTextNode(previousNode) && endsWithSeparator(previousNode.getTextContent());
	}

	function isNextNodeValid(node) {
		let nextNode = node.getNextSibling();

		if (isElementNode(nextNode)) {
			nextNode = nextNode.getFirstDescendant();
		}

		return nextNode === null || isLineBreakNode(nextNode) || isTextNode(nextNode) && startsWithSeparator(nextNode.getTextContent());
	}

	function isContentAroundIsValid(matchStart, matchEnd, text, nodes) {
		const contentBeforeIsValid = matchStart > 0
			? isSeparator(text[matchStart - 1])
			: isPreviousNodeValid(nodes[0]);

		if (!contentBeforeIsValid) {
			return false;
		}

		const contentAfterIsValid = matchEnd < text.length
			? isSeparator(text[matchEnd])
			: isNextNodeValid(nodes[nodes.length - 1]);

		return contentAfterIsValid;
	}

	function extractMatchingNodes(nodes, startIndex, endIndex) {
		const unmodifiedBeforeNodes = [];
		const matchingNodes = [];
		const unmodifiedAfterNodes = [];
		let matchingOffset = 0;
		let currentOffset = 0;
		const currentNodes = [...nodes];

		while (currentNodes.length > 0) {
			const currentNode = currentNodes[0];
			const currentNodeText = currentNode.getTextContent();
			const currentNodeLength = currentNodeText.length;
			const currentNodeStart = currentOffset;
			const currentNodeEnd = currentOffset + currentNodeLength;

			if (currentNodeEnd <= startIndex) {
				unmodifiedBeforeNodes.push(currentNode);
				matchingOffset += currentNodeLength;
			} else if (currentNodeStart >= endIndex) {
				unmodifiedAfterNodes.push(currentNode);
			} else {
				matchingNodes.push(currentNode);
			}

			currentOffset += currentNodeLength;
			currentNodes.shift();
		}

		return [
			matchingOffset,
			unmodifiedBeforeNodes,
			matchingNodes,
			unmodifiedAfterNodes
		];
	}

	function createAutoLinkNodeLocal(nodes, startIndex, endIndex, match) {
		const linkNode = createAutoLinkNode(match.url, match.attributes);

		if (nodes.length === 1) {
			let remainingTextNode = nodes[0];
			let linkTextNode;

			if (startIndex === 0) {
				[linkTextNode, remainingTextNode] = remainingTextNode.splitText(endIndex);
			} else {
				[, linkTextNode, remainingTextNode] = remainingTextNode.splitText(startIndex, endIndex);
			}

			const textNode = createTextNode(match.text);

			textNode.setFormat(linkTextNode.getFormat());
			textNode.setDetail(linkTextNode.getDetail());
			textNode.setStyle(linkTextNode.getStyle());
			linkNode.append(textNode);
			linkTextNode.replace(linkNode);

			return remainingTextNode;
		} else if (nodes.length > 1) {
			const firstTextNode = nodes[0];
			let offset = firstTextNode.getTextContent().length;
			let firstLinkTextNode;

			if (startIndex === 0) {
				firstLinkTextNode = firstTextNode;
			} else {
				[, firstLinkTextNode] = firstTextNode.splitText(startIndex);
			}

			const linkNodes = [];
			let remainingTextNode;

			for (let i = 1; i < nodes.length; i++) {
				const currentNode = nodes[i];
				const currentNodeText = currentNode.getTextContent();
				const currentNodeLength = currentNodeText.length;
				const currentNodeStart = offset;
				const currentNodeEnd = offset + currentNodeLength;

				if (currentNodeStart < endIndex) {
					if (currentNodeEnd <= endIndex) {
						linkNodes.push(currentNode);
					} else {
						const [linkTextNode, endNode] = currentNode.splitText(endIndex - currentNodeStart);

						linkNodes.push(linkTextNode);
						remainingTextNode = endNode;
					}
				}

				offset += currentNodeLength;
			}

			const selection = getSelection();
			const selectedTextNode = selection ? selection.getNodes().find(isTextNode) : undefined;
			const textNode = createTextNode(firstLinkTextNode.getTextContent());

			textNode.setFormat(firstLinkTextNode.getFormat());
			textNode.setDetail(firstLinkTextNode.getDetail());
			textNode.setStyle(firstLinkTextNode.getStyle());
			linkNode.append(textNode, ...linkNodes);

			// it does not preserve caret position if caret was at the first text node
			// so we need to restore caret position
			if (selectedTextNode && selectedTextNode === firstLinkTextNode) {
				if (isRangeSelection(selection)) {
					textNode.select(selection.anchor.offset, selection.focus.offset);
				} else if (isNodeSelection(selection)) {
					textNode.select(0, textNode.getTextContent().length);
				}
			}

			firstLinkTextNode.replace(linkNode);

			return remainingTextNode;
		}

		return undefined;
	}

	function handleLinkCreation(nodes, matchers, onChange) {
		let currentNodes = [...nodes];
		const initialText = currentNodes.map((node) => node.getTextContent()).join('');
		let text = initialText;
		let match;
		let invalidMatchEnd = 0;

		while ((match = findFirstMatch(text, matchers)) && match !== null) {
			const matchStart = match.index;
			const matchLength = match.length;
			const matchEnd = matchStart + matchLength;
			const isValid = isContentAroundIsValid(invalidMatchEnd + matchStart, invalidMatchEnd + matchEnd, initialText, currentNodes);

			if (isValid) {
				const [matchingOffset,, matchingNodes, unmodifiedAfterNodes] = extractMatchingNodes(currentNodes, invalidMatchEnd + matchStart, invalidMatchEnd + matchEnd);
				const actualMatchStart = invalidMatchEnd + matchStart - matchingOffset;
				const actualMatchEnd = invalidMatchEnd + matchEnd - matchingOffset;
				const remainingTextNode = createAutoLinkNodeLocal(matchingNodes, actualMatchStart, actualMatchEnd, match);

				currentNodes = remainingTextNode
					? [remainingTextNode, ...unmodifiedAfterNodes]
					: unmodifiedAfterNodes;

				onChange(match.url, null);
				invalidMatchEnd = 0;
			} else {
				invalidMatchEnd += matchEnd;
			}

			text = text.substring(matchEnd);
		}
	}

	function handleLinkEdit(linkNode, matchers, onChange) {
		// Check children are simple text
		const children = linkNode.getChildren();

		const childrenLength = children.length;

		for (let i = 0; i < childrenLength; i++) {
			const child = children[i];

			if (!isTextNode(child) || !child.isSimpleText()) {
				replaceWithChildren(linkNode);
				onChange(null, linkNode.getURL());

				return;
			}
		}

		// Check text content fully matches
		const text = linkNode.getTextContent();

		const match = findFirstMatch(text, matchers);

		if (match === null || match.text !== text) {
			replaceWithChildren(linkNode);
			onChange(null, linkNode.getURL());

			return;
		}

		// Check neighbors
		if (!isPreviousNodeValid(linkNode) || !isNextNodeValid(linkNode)) {
			replaceWithChildren(linkNode);
			onChange(null, linkNode.getURL());

			return;
		}

		const url = linkNode.getURL();

		if (url !== match.url) {
			linkNode.setURL(match.url);
			onChange(match.url, url);
		}

		if (match.attributes) {
			const rel = linkNode.getRel();

			if (rel !== match.attributes.rel) {
				linkNode.setRel(match.attributes.rel || null);
				onChange(match.attributes.rel || null, rel);
			}

			const target = linkNode.getTarget();

			if (target !== match.attributes.target) {
				linkNode.setTarget(match.attributes.target || null);
				onChange(match.attributes.target || null, target);
			}
		}
	}

	// Bad neighbors are edits in neighbor nodes that make AutoLinks incompatible.
	// Given the creation preconditions, these can only be simple text nodes.
	function handleBadNeighbors(textNode, matchers, onChange) {
		const previousSibling = textNode.getPreviousSibling();
		const nextSibling = textNode.getNextSibling();
		const text = textNode.getTextContent();

		if (isAutoLinkNode(previousSibling) && !previousSibling.getIsUnlinked() && (!startsWithSeparator(text) || startsWithTLD(text, previousSibling.isEmailURI()))) {
			previousSibling.append(textNode);
			handleLinkEdit(previousSibling, matchers, onChange);
			onChange(null, previousSibling.getURL());
		}

		if (isAutoLinkNode(nextSibling) && !nextSibling.getIsUnlinked() && !endsWithSeparator(text)) {
			replaceWithChildren(nextSibling);
			handleLinkEdit(nextSibling, matchers, onChange);
			onChange(null, nextSibling.getURL());
		}
	}

	function replaceWithChildren(node) {
		const children = node.getChildren();
		const childrenLength = children.length;

		for (let j = childrenLength - 1; j >= 0; j--) {
			node.insertAfter(children[j]);
		}

		node.remove();

		return children.map((child) => child.getLatest());
	}

	function getTextNodesToMatch(textNode) {
		// check if next siblings are simple text nodes till a node contains a space separator
		const textNodesToMatch = [textNode];

		let nextSibling = textNode.getNextSibling();

		while (nextSibling !== null && isTextNode(nextSibling) && nextSibling.isSimpleText()) {
			textNodesToMatch.push(nextSibling);

			if ((/[\s]/).test(nextSibling.getTextContent())) {
				break;
			}

			nextSibling = nextSibling.getNextSibling();
		}

		return textNodesToMatch;
	}

	const editor = getEditor();
	let onChange = $.prop($$props, 'onChange', 3, undefined);

	onMount(() => {
		if (!editor.hasNodes([AutoLinkNode])) {
			throw new Error('AutoLinkPlugin: AutoLinkNode not registered on editor');
		}

		const onChangeWrapped = (url, prevUrl) => {
			if (onChange()) {
				onChange()(url, prevUrl);
			}
		};

		return mergeRegister(
			editor.registerNodeTransform(TextNode, (textNode) => {
				const parent = textNode.getParentOrThrow();
				const previous = textNode.getPreviousSibling();

				if (isAutoLinkNode(parent) && !parent.getIsUnlinked()) {
					handleLinkEdit(parent, $$props.matchers, onChangeWrapped);
				} else if (!isLinkNode(parent)) {
					if (textNode.isSimpleText() && (startsWithSeparator(textNode.getTextContent()) || !isAutoLinkNode(previous))) {
						const textNodesToMatch = getTextNodesToMatch(textNode);

						handleLinkCreation(textNodesToMatch, $$props.matchers, onChangeWrapped);
					}

					handleBadNeighbors(textNode, $$props.matchers, onChangeWrapped);
				}
			}),
			editor.registerCommand(
				TOGGLE_LINK_COMMAND,
				(payload) => {
					const selection = getSelection();

					if (payload !== null || !isRangeSelection(selection)) {
						return false;
					}

					const nodes = selection.extract();

					nodes.forEach((node) => {
						const parent = node.getParent();

						if (isAutoLinkNode(parent)) {
							// invert the value
							parent.setIsUnlinked(!parent.getIsUnlinked());

							parent.markDirty();
						}
					});

					return false;
				},
				COMMAND_PRIORITY_LOW
			)
		);
	});

	$.pop();
}