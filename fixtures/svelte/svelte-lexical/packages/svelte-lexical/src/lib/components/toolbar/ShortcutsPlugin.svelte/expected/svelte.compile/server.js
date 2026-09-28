import * as $ from 'svelte/internal/server';
import { getActiveEditor, getBlockType, getFontSize, getIsLink } from '$lib/core/composerContext.js';

import {
	COMMAND_PRIORITY_NORMAL,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	INDENT_CONTENT_COMMAND,
	isModifierMatch,
	KEY_DOWN_COMMAND,
	OUTDENT_CONTENT_COMMAND
} from 'lexical';

import {
	clearFormatting,
	formatBulletList,
	formatCheckList,
	formatCode,
	formatHeading,
	formatNumberedList,
	formatParagraph,
	formatQuote,
	InsertLink,
	toggleStrikethrough,
	toggleSubscript,
	toggleSuperscript
} from '$lib/core/commands/commands.js';

import {
	isCenterAlign,
	isClearFormatting,
	isDecreaseFontSize,
	isFormatBulletList,
	isFormatCheckList,
	isFormatCode,
	isFormatHeading,
	isFormatNumberedList,
	isFormatParagraph,
	isFormatQuote,
	isIncreaseFontSize,
	isIndent,
	isInsertCodeBlock,
	isInsertLink,
	isJustifyAlign,
	isLeftAlign,
	isOutdent,
	isRightAlign,
	isStrikeThrough,
	isSubscript,
	isSuperscript
} from './shortcuts.js';

import { decreaseFontSize, increaseFontSize } from '$lib/core/commands/updateFontSize.js';

export default function ShortcutsPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const blockType = getBlockType();
		const isLink = getIsLink();
		const fontSize = getFontSize();

		const keyboardShortcutsHandler = (event) => {
			// Short-circuit, a least one modifier must be set
			if (isModifierMatch(event, {})) {
				return false;
			} else if (isFormatParagraph(event)) {
				formatParagraph($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			} else if (isFormatHeading(event)) {
				const { code } = event;
				const headingSize = `h${code[code.length - 1]}`;

				formatHeading($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$blockType', blockType), headingSize);
			} else if (isFormatBulletList(event)) {
				formatBulletList($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$blockType', blockType));
			} else if (isFormatNumberedList(event)) {
				formatNumberedList($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$blockType', blockType));
			} else if (isFormatCheckList(event)) {
				formatCheckList($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$blockType', blockType));
			} else if (isFormatCode(event)) {
				formatCode($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$blockType', blockType));
			} else if (isFormatQuote(event)) {
				formatQuote($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$blockType', blockType));
			} else if (isStrikeThrough(event)) {
				toggleStrikethrough($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			} else if (isIndent(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
			} else if (isOutdent(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
			} else if (isCenterAlign(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
			} else if (isLeftAlign(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
			} else if (isRightAlign(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
			} else if (isJustifyAlign(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
			} else if (isSubscript(event)) {
				toggleSubscript($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			} else if (isSuperscript(event)) {
				toggleSuperscript($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			} else if (isInsertCodeBlock(event)) {
				$.store_get($$store_subs ??= {}, '$activeEditor', activeEditor).dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
			} else if (isIncreaseFontSize(event)) {
				increaseFontSize($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), Number($.store_get($$store_subs ??= {}, '$fontSize', fontSize).slice(0, -2)));
			} else if (isDecreaseFontSize(event)) {
				decreaseFontSize($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), Number($.store_get($$store_subs ??= {}, '$fontSize', fontSize).slice(0, -2)));
			} else if (isClearFormatting(event)) {
				clearFormatting($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor));
			} else if (isInsertLink(event)) {
				InsertLink($.store_get($$store_subs ??= {}, '$activeEditor', activeEditor), $.store_get($$store_subs ??= {}, '$isLink', isLink));
			} else {
				// No match for any of the event handlers
				return false;
			}

			event.preventDefault();

			return true;
		};

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}