import * as $ from 'svelte/internal/server';
import Copy from './icons/Copy.svelte';
import CopyDone from './icons/CopyDone.svelte';

export default function CopyCode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let container = void 0;
		let copied = false;

		function handleClick() {
			const content = container?.parentElement?.querySelector('.shiki')?.textContent || '';

			navigator.clipboard.writeText(content);
			copied = true;

			setTimeout(
				() => {
					copied = false;
				},
				2000
			);
		}

		if (copied) {
			$$renderer.push(`<!--[0--><div class="svp-code-block--copy-code">`);
			CopyDone($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="svp-code-block--copy-code" role="button" tabindex="0" aria-label="Copy code">`);
			Copy($$renderer, {});
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}