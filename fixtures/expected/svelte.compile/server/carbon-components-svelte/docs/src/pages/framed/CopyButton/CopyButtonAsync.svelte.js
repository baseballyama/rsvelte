import * as $ from 'svelte/internal/server';
import { CopyButton } from "carbon-components-svelte";

export default function CopyButtonAsync($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		CopyButton($$renderer, {
			iconDescription: 'Copy fetched content',
			feedback: 'Copied!',
			copy: copyContent
		});
	});
}