import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { themes } from '$lib/constants/themes';
import { importThemeV2 } from '$lib/utils/importer/import-theme-v2';
import { importThemeV3 } from '$lib/utils/importer/import-theme-v3';
import { importThemeV5, parseThemeProperties } from '$lib/utils/importer/import-theme-v5';
import { isV5Format } from '$lib/utils/importer/migrate-legacy-keys';
import FileUpIcon from '@lucide/svelte/icons/file-up';
import { FileUpload } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Themes
		// Utils
		const defaultThemeName = 'cerberus';

		/** Routes a CSS theme file to the v5 importer directly, or through the legacy (v3) migration first. */
		function importThemeCss(fileText, fileName) {
			if (isV5Format(parseThemeProperties(fileText))) {
				importThemeV5(fileText, fileName);
			} else {
				importThemeV3(fileText, fileName);
			}
		}

		function resetToDefaults() {
			const defaultTheme = themes.find((t) => t.name === defaultThemeName);

			importThemeCss(defaultTheme.css, defaultThemeName);
		}

		function onSelectTemplate(fileCss, fileName) {
			// Reset to default theme
			if (fileName !== defaultThemeName) {
				resetToDefaults();
			}

			// Run template import
			importThemeCss(fileCss, fileName);

			// Redirect to Generator page
			goto(resolve('/themes/create'));
		}

		const onFileChange = async (event) => {
			if (event.acceptedFiles.length <= 0) return;

			// Reset to default theme
			resetToDefaults();

			// Gather Theme Data
			const fileName = event.acceptedFiles[0].name;

			const file = event.acceptedFiles[0];
			const fileText = await file.text();
			const isCssFormat = fileName.includes('.css');

			// Run Importer
			if (isCssFormat) {
				importThemeCss(fileText, fileName);
			} else {
				// Legacy v2 format (.ts/.js) — colors-only, upconverts into v5 state automatically since
				// the reset-to-defaults pass above already seeded everything else with v5 (Cerberus) values.
				importThemeV2(fileText, fileName);
			}

			// Redirect to Generator page
			goto('/themes/create');
		};

		$$renderer.push(`<div class="space-y-10">`);

		FileUpload($$renderer, {
			class: 'w-full',
			name: 'file',
			accept: '.css, .ts, .js',
			onFileChange,
			children: ($$renderer) => {
				if (FileUpload.Dropzone) {
					$$renderer.push('<!--[-->');

					FileUpload.Dropzone($$renderer, {
						class: 'py-32',
						children: ($$renderer) => {
							FileUpIcon($$renderer, { class: 'size-16' });
							$$renderer.push(`<!----> <span>Select file or drag here.</span> <span class="text-sm opacity-50">Accepts .css, .ts, or .js file formats.</span> `);

							if (FileUpload.HiddenInput) {
								$$renderer.push('<!--[-->');
								FileUpload.HiddenInput($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex justify-center gap-4"><span class="opacity-10">—</span> <span class="opacity-60">or select a template</span> <span class="opacity-10">—</span></div> <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"><!--[-->`);

		const each_array = $.ensure_array_like(themes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let theme = each_array[$$index];

			$$renderer.push(`<button${$.attr('data-theme', theme.name)} class="w-full bg-surface-50-950 p-4 preset-outlined-surface-200-800 hover:preset-outlined-surface-800-200 rounded-md grid grid-cols-[auto_1fr_auto] items-center gap-4"><span>${$.escape(theme.emoji)}</span> <h3 class="h6 capitalize text-left">${$.escape(theme.name)}</h3> <div class="flex justify-center items-center -space-x-1"><div class="aspect-square w-5 bg-primary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-secondary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-tertiary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-success-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-warning-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-error-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-surface-500 border-[1px] border-black/10 rounded-full"></div></div></button>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}