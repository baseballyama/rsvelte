import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { themes } from '$lib/constants/themes';
import { importThemeV2 } from '$lib/utils/importer/import-theme-v2';
import { importThemeV3 } from '$lib/utils/importer/import-theme-v3';
import { importThemeV5, parseThemeProperties } from '$lib/utils/importer/import-theme-v5';
import { isV5Format } from '$lib/utils/importer/migrate-legacy-keys';
import FileUpIcon from '@lucide/svelte/icons/file-up';
import { FileUpload } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <span>Select file or drag here.</span> <span class="text-sm opacity-50">Accepts .css, .ts, or .js file formats.</span> <!>`, 1);
var root_1 = $.from_html(`<button class="w-full bg-surface-50-950 p-4 preset-outlined-surface-200-800 hover:preset-outlined-surface-800-200 rounded-md grid grid-cols-[auto_1fr_auto] items-center gap-4"><span> </span> <h3 class="h6 capitalize text-left"> </h3> <div class="flex justify-center items-center -space-x-1"><div class="aspect-square w-5 bg-primary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-secondary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-tertiary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-success-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-warning-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-error-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-5 bg-surface-500 border-[1px] border-black/10 rounded-full"></div></div></button>`);
var root_2 = $.from_html(`<div class="space-y-10"><!> <div class="flex justify-center gap-4"><span class="opacity-10">&mdash;</span> <span class="opacity-60">or select a template</span> <span class="opacity-10">&mdash;</span></div> <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_2();
	var node = $.child(div);

	FileUpload(node, {
		class: 'w-full',
		name: 'file',
		accept: '.css, .ts, .js',
		onFileChange,
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => FileUpload.Dropzone, ($$anchor, FileUpload_Dropzone) => {
				FileUpload_Dropzone($$anchor, {
					class: 'py-32',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						FileUpIcon(node_2, { class: 'size-16' });

						var node_3 = $.sibling(node_2, 6);

						$.component(node_3, () => FileUpload.HiddenInput, ($$anchor, FileUpload_HiddenInput) => {
							FileUpload_HiddenInput($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 4);

	$.each(div_1, 21, () => themes, (theme) => theme.name, ($$anchor, theme) => {
		var button = root_1();
		var span = $.child(button);
		var text = $.only_child(span, true);
		var h3 = $.sibling(span, 2);
		var text_1 = $.only_child(h3, true);

		$.next(2);
		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'data-theme', $.get(theme).name);
			$.set_text(text, $.get(theme).emoji);
			$.set_text(text_1, $.get(theme).name);
		});

		$.delegated('click', button, () => onSelectTemplate($.get(theme).css, $.get(theme).name));
		$.append($$anchor, button);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);