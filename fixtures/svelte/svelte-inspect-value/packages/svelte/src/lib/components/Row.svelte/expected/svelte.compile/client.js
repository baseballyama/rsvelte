import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	enterFocusScope,
	exitFocusScope,
	focusFirst,
	focusLast,
	focusNext,
	focusPrev,
	focusTarget
} from '../attachments/focus.js';

import { getContext, tick } from 'svelte';
import { getTypingBuffer } from '../typingbuffer.svelte.js';
import { useOptions } from '../options.svelte.js';

var root = $.from_html(`<div data-testid="row" role="button"><!></div>`);

export default function Row($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, true),
		previewLevel = $.prop($$props, 'previewLevel', 3, 0),
		borderless = $.prop($$props, 'borderless', 3, false);

	const focusId = getContext(Symbol.for('siv.focus-id'));
	const typingBuffer = getTypingBuffer();
	const options = useOptions();

	function onclick() {
		$$props.onchange?.(!$$props.collapsed);
	}

	function onkeydown(event) {
		let shouldPreventDefault = true;

		if (event.metaKey || event.ctrlKey || event.altKey) return; // no modifier keys

		if (event.key.length === 1 && options.value.typeToFocus) {
			typingBuffer.type(event.key);

			return;
		}

		if (options.value.disableKeynav) return;

		switch (event.code) {
			case 'Space':
				{
					$$props.onchange?.(!$$props.collapsed);

					break;
				}

			case 'ArrowUp':
				{
					focusPrev(focusId);

					break;
				}

			case 'ArrowDown':
				{
					focusNext(focusId);

					break;
				}

			case 'ArrowLeft':
				{
					if (!$$props.collapsed) {
						$$props.onchange?.(true);
					} else {
						exitFocusScope(focusId);
					}

					break;
				}

			case 'Enter':
				{
					if (!disabled()) {
						if ($$props.collapsed) {
							$$props.onchange?.(false);
							tick().then(enterFocusScope);
						} else {
							const didFocus = enterFocusScope();

							if (!didFocus) {
								$$props.onchange?.(true);
							}
						}
					} else {
						focusNext(focusId);
					}

					break;
				}

			case 'ArrowRight':
				{
					if ($$props.collapsed && !disabled()) {
						$$props.onchange?.(false);
					} else {
						if (!enterFocusScope()) {
							focusNext(focusId);
						}
					}

					break;
				}

			case 'Home':
				{
					focusFirst(focusId);

					break;
				}

			case 'End':
				{
					focusLast(focusId);

					break;
				}

			default:
				{
					shouldPreventDefault = false;

					break;
				}
		}

		if (shouldPreventDefault) {
			event.preventDefault();
		}
	}

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.attach(div, () => focusTarget($$props.isFocusTarget));

	$.template_effect(() => {
		$.set_class(
			div,
			1,
			$.clsx([
				'row-target',
				disabled() && 'disabled',
				!borderless() && 'full-width'
			]),
			'svelte-12dea5u'
		);

		$.set_attribute(div, 'aria-disabled', disabled());
		$.set_attribute(div, 'tabindex', previewLevel() > 0 ? -1 : 0);
	});

	$.delegated('click', div, onclick);

	$.delegated('keydown', div, function (...$$args) {
		(!options.value.disableKeynav || options.value.typeToFocus ? onkeydown : undefined)?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);