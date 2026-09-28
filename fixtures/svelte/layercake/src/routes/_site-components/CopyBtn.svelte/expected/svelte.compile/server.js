import * as $ from 'svelte/internal/server';
import CopyIcon from './CopyIcon.svelte';

export default function CopyBtn($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ getText: Function }} */
		let { getText } = $$props;

		async function copyToClipboard() {
			let text = getText();

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

		$$renderer.push(`<button aria-label="Copy to clipboard" class="copy svelte-rutdsx">`);
		CopyIcon($$renderer, {});
		$$renderer.push(`<!----></button>`);
	});
}