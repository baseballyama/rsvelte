import * as $ from 'svelte/internal/server';
import CopyIcon from '@lucide/svelte/icons/copy';
import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';

export default function Pre($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			filename,
			highlights,
			language,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let preRef = void 0;
		let copied = false;

		async function copyCode() {
			const code = preRef?.textContent;

			if (!code) return;

			await navigator.clipboard.writeText(code);
			copied = true;
		}

		$$renderer.push(`<div class="prose-pre shadow-lg">`);

		if (filename || language) {
			$$renderer.push(`<!--[0--><header class="pb-2 flex justify-between items-center"><span class="text-xs opacity-50">${$.escape(filename ?? language)}</span> <button class="btn-icon btn-icon-sm preset-outlined-surface-200-800 hover:preset-tonal">`);

			if (copied) {
				$$renderer.push('<!--[0-->');
				ThumbsUpIcon($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				CopyIcon($$renderer, {});
			}

			$$renderer.push(`<!--]--></button></header>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <pre${$.attributes({ ...rest, style: 'white-space: pre-wrap;' })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></pre></div>`);
	});
}