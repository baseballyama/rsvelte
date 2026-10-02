import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyIcon from './CopyIcon.svelte';

var root = $.from_html(`<button aria-label="Copy to clipboard" class="copy svelte-rutdsx"><!></button>`);

export default function CopyBtn($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ getText: Function }} */
	async function copyToClipboard() {
		let text = $$props.getText();

		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(text);

				return true;
			} else {
				const textarea = document.createElement('textarea');

				textarea.value = text;
				textarea.style.position = 'fixed';
				textarea.style.left = '-999999px';
				textarea.style.top = '-999999px';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();

				const success = document.execCommand('copy');

				document.body.removeChild(textarea);

				return success;
			}
		} catch(error) {
			console.warn('Copy to clipboard failed:', error);

			return false;
		}
	}

	var button = root();
	var node = $.child(button);

	CopyIcon(node, {});
	$.reset(button);
	$.delegated('click', button, copyToClipboard);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);