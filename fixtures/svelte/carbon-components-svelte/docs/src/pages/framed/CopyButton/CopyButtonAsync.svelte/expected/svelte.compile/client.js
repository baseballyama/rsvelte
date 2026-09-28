import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from "carbon-components-svelte";

export default function CopyButtonAsync($$anchor, $$props) {
	$.push($$props, true);

	const content = "Text fetched on demand";
	let cachedContent = null;

	async function prefetchContent() {
		if (cachedContent) return;

		await new Promise((resolve) => setTimeout(resolve, 300));
		cachedContent = content;
	}

	async function copyContent() {
		if (!cachedContent) {
			await prefetchContent();
		}

		await navigator.clipboard.writeText(cachedContent);
	}

	CopyButton($$anchor, {
		iconDescription: 'Copy fetched content',
		feedback: 'Copied!',
		copy: copyContent,
		$$events: {
			mouseenter: prefetchContent,
			'copy:error': (e) => {
				console.error("Copy failed", e.detail.error);
			}
		}
	});

	$.pop();
}