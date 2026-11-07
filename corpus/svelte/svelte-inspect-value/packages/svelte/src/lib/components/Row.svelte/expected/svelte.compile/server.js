import * as $ from 'svelte/internal/server';

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

export default function Row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			collapsed,
			disabled = true,
			children,
			onchange,
			isFocusTarget,
			previewLevel = 0,
			borderless = false
		} = $$props;

		const focusId = getContext(Symbol.for('siv.focus-id'));
		const typingBuffer = getTypingBuffer();
		const options = useOptions();

		function onclick() {
			onchange?.(!collapsed);
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
						onchange?.(!collapsed);

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
						if (!collapsed) {
							onchange?.(true);
						} else {
							exitFocusScope(focusId);
						}

						break;
					}

				case 'Enter':
					{
						if (!disabled) {
							if (collapsed) {
								onchange?.(false);
								tick().then(enterFocusScope);
							} else {
								const didFocus = enterFocusScope();

								if (!didFocus) {
									onchange?.(true);
								}
							}
						} else {
							focusNext(focusId);
						}

						break;
					}

				case 'ArrowRight':
					{
						if (collapsed && !disabled) {
							onchange?.(false);
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

		$$renderer.push(`<div data-testid="row" role="button"${$.attr_class(
			$.clsx([
				'row-target',
				disabled && 'disabled',
				!borderless && 'full-width'
			]),
			'svelte-12dea5u'
		)}${$.attr('aria-disabled', disabled)}${$.attr('tabindex', previewLevel > 0 ? -1 : 0)}>`);

		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}