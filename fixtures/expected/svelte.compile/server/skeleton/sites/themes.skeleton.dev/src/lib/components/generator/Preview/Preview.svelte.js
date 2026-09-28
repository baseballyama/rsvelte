import * as $ from 'svelte/internal/server';
import CodeBlock from '$lib/components/common/CodeBlock/CodeBlock.svelte';
import { globals, settingsCustomFonts } from '$lib/state/generator.svelte';
import { generateFontImports, generateFontInstallCommand } from '$lib/utils/generator/generate-font-install';
import { generateTheme } from '$lib/utils/generator/generate-theme';
import PreviewComponents from './PreviewComponents.svelte';
import PreviewPalette from './PreviewPalette.svelte';
import PreviewTypography from './PreviewTypography.svelte';
import CopyIcon from '@lucide/svelte/icons/copy';

export default function Preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Components (common)
		// Utils
		// Components (generator)
		// Icons
		function copyToClipboard() {
			if (!window.isSecureContext) {
				console.error('Needs secure context: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard');

				return {};
			}

			navigator.clipboard.writeText(generateTheme());
		}

		$$renderer.push(`<section class="relative h-screen overflow-y-auto"><article class="container mx-auto">`);

		if (globals.panel === 'preview') {
			$$renderer.push(`<!--[0--><section class="p-8 space-y-10">`);
			PreviewComponents($$renderer, {});
			$$renderer.push(`<!----> <hr class="hr"/> `);
			PreviewPalette($$renderer, {});
			$$renderer.push(`<!----> <hr class="hr"/> `);
			PreviewTypography($$renderer, {});
			$$renderer.push(`<!----></section>`);
		} else {
			$$renderer.push(`<!--[-1--><section class="p-8 space-y-5">`);

			if (settingsCustomFonts.font1 || settingsCustomFonts.font2) {
				$$renderer.push(`<!--[0--><div class="space-y-5"><p class="opacity-60">Install you custom fonts via Fontsource.</p> `);
				CodeBlock($$renderer, { lang: 'console', code: generateFontInstallCommand() });
				$$renderer.push(`<!----> <p class="opacity-60">Import and register the fonts in your global CSS stylesheet.</p> `);
				CodeBlock($$renderer, { lang: 'css', code: generateFontImports() });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <header class="flex justify-between items-center gap-4"><p><span class="opacity-60">Copy the theme code and follow the</span> <a href="https://www.skeleton.dev/docs/svelte/design/themes#custom-themes" target="_blank" class="anchor">documentation instructions</a>.</p> <button type="button" class="btn preset-filled">`);
			CopyIcon($$renderer, {});
			$$renderer.push(`<!----> <span>Copy</span></button></header> `);
			CodeBlock($$renderer, { lang: 'css', code: generateTheme() });
			$$renderer.push(`<!----></section>`);
		}

		$$renderer.push(`<!--]--></article> <footer class="p-10 py-5"><p class="text-xs text-center opacity-20">Built by Skeleton Labs and the Skeleton community.</p></footer></section>`);
	});
}