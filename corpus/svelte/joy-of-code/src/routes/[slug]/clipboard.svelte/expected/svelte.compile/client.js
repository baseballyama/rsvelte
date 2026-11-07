import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Clipboard($$anchor, $$props) {
	$.push($$props, true);

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

	$.user_effect(() => {
		const copyBtnEl = document.querySelectorAll('.copy');

		copyBtnEl.forEach((btn) => {
			btn.innerHTML = `
        <span class="sr-only">Copy</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-copy"
				>
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</svg>
      `;

			btn.addEventListener('click', copyToClipboard);
		});

		return () => copyBtnEl.forEach((btn) => {
			btn.removeEventListener('click', copyToClipboard);
		});
	});

	$.pop();
}