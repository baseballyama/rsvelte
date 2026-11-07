import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeBlock from '$lib/components/common/CodeBlock/CodeBlock.svelte';
import { globals, settingsCustomFonts } from '$lib/state/generator.svelte';
import { generateFontImports, generateFontInstallCommand } from '$lib/utils/generator/generate-font-install';
import { generateTheme } from '$lib/utils/generator/generate-theme';
import PreviewComponents from './PreviewComponents.svelte';
import PreviewPalette from './PreviewPalette.svelte';
import PreviewTypography from './PreviewTypography.svelte';
import CopyIcon from '@lucide/svelte/icons/copy';

var root = $.from_html(`<section class="p-8 space-y-10"><!> <hr class="hr"/> <!> <hr class="hr"/> <!></section>`);
var root_1 = $.from_html(`<div class="space-y-5"><p class="opacity-60">Install you custom fonts via Fontsource.</p> <!> <p class="opacity-60">Import and register the fonts in your global CSS stylesheet.</p> <!></div>`);
var root_2 = $.from_html(`<section class="p-8 space-y-5"><!> <header class="flex justify-between items-center gap-4"><p><span class="opacity-60">Copy the theme code and follow the</span> <a href="https://www.skeleton.dev/docs/svelte/design/themes#custom-themes" target="_blank" class="anchor">documentation instructions</a>.</p> <button type="button" class="btn preset-filled"><!> <span>Copy</span></button></header> <!></section>`);
var root_3 = $.from_html(`<section class="relative h-screen overflow-y-auto"><article class="container mx-auto"><!></article> <footer class="p-10 py-5"><p class="text-xs text-center opacity-20">Built by Skeleton Labs and the Skeleton community.</p></footer></section>`);

export default function Preview($$anchor, $$props) {
	$.push($$props, true);

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

	var section = root_3();
	var article = $.child(section);
	var node = $.child(article);

	{
		var consequent = ($$anchor) => {
			var section_1 = root();
			var node_1 = $.child(section_1);

			PreviewComponents(node_1, {});

			var node_2 = $.sibling(node_1, 4);

			PreviewPalette(node_2, {});

			var node_3 = $.sibling(node_2, 4);

			PreviewTypography(node_3, {});
			$.reset(section_1);
			$.append($$anchor, section_1);
		};

		var alternate = ($$anchor) => {
			var section_2 = root_2();
			var node_4 = $.child(section_2);

			{
				var consequent_1 = ($$anchor) => {
					var div = root_1();
					var node_5 = $.sibling($.child(div), 2);

					{
						let $0 = $.derived(generateFontInstallCommand);

						CodeBlock(node_5, {
							lang: 'console',
							get code() {
								return $.get($0);
							}
						});
					}

					var node_6 = $.sibling(node_5, 4);

					{
						let $0 = $.derived(generateFontImports);

						CodeBlock(node_6, {
							lang: 'css',
							get code() {
								return $.get($0);
							}
						});
					}

					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_4, ($$render) => {
					if (settingsCustomFonts.font1 || settingsCustomFonts.font2) $$render(consequent_1);
				});
			}

			var header = $.sibling(node_4, 2);
			var button = $.sibling($.child(header), 2);
			var node_7 = $.child(button);

			CopyIcon(node_7, {});
			$.next(2);
			$.reset(button);
			$.reset(header);

			var node_8 = $.sibling(header, 2);

			{
				let $0 = $.derived(generateTheme);

				CodeBlock(node_8, {
					lang: 'css',
					get code() {
						return $.get($0);
					}
				});
			}

			$.reset(section_2);
			$.delegated('click', button, copyToClipboard);
			$.append($$anchor, section_2);
		};

		$.if(node, ($$render) => {
			if (globals.panel === 'preview') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(article);
	$.next(2);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);