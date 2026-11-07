import * as $ from 'svelte/internal/server';

export default function Clipboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function copyToClipboard(event) {
			const buttonEl = event.currentTarget;
			const codeTitleEl = buttonEl.parentElement;
			const text = codeTitleEl?.nextElementSibling?.textContent;

			text && navigator.clipboard.writeText(text);
			showCopiedMessage(buttonEl);
		}

		function showCopiedMessage(el) {
			let contents = el.innerHTML;

			el.innerHTML = 'Copied';
			setTimeout(() => el.innerHTML = contents, 1000);
		}
	});
}