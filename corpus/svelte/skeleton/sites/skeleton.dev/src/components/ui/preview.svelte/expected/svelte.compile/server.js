import * as $ from 'svelte/internal/server';
import OpenInStackblitz from './open-in-stackblitz.svelte';
import Code from '@/components/ui/code.svelte';
import CodeIcon from '@lucide/svelte/icons/code';
import EyeIcon from '@lucide/svelte/icons/eye';
import PaletteIcon from '@lucide/svelte/icons/palette';
import { Tabs, ToggleGroup, LocaleProvider } from '@skeletonlabs/skeleton-svelte';

const presets = [
	'',
	'bg-surface-50-950',
	'preset-filled-primary-500',
	'preset-filled-secondary-500',
	'preset-filled-tertiary-500',
	'preset-filled-success-500',
	'preset-filled-warning-500',
	'preset-filled-error-500',
	'preset-filled-surface-500',
	'bg-linear-to-br from-primary-500 to-secondary-500',
	'bg-linear-to-br from-secondary-500 to-tertiary-500',
	'bg-linear-to-br from-tertiary-500 to-primary-500'
];

let activePreset = presets[0];
let direction = 'ltr';

export default function Preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, framework, files = {}, learnUrl } = $$props;
		let viewMode = 'preview';
		let customizeMode = '';
		const fileEntries = $.derived(() => Object.entries(files));

		$$renderer.push(`<div class="card border border-surface-200-800 max-w-full overflow-hidden"><header class="flex justify-between items-center gap-3 border-b border-surface-200-800 p-3"><div class="flex items-center gap-2">`);

		ToggleGroup($$renderer, {
			value: [viewMode],
			onValueChange: (details) => viewMode = details.value[0],
			deselectable: false,
			children: ($$renderer) => {
				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'preview',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'Preview Feature',
						'aria-label': 'Preview Feature',
						children: ($$renderer) => {
							EyeIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'code',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'View Code',
						'aria-label': 'View Code',
						children: ($$renderer) => {
							CodeIcon($$renderer, { class: 'size-4' });
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

		$$renderer.push(`<!----> `);

		if (learnUrl) {
			$$renderer.push(`<!--[0--><a${$.attr('href', learnUrl)} target="_blank" rel="noopener noreferrer" class="btn preset-outlined-surface-200-800 hover:preset-tonal" title="Learn how to use this feature." aria-label="Learn how to use this feature.">Learn</a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-2">`);

		ToggleGroup($$renderer, {
			value: direction === 'rtl' ? ['rtl'] : [],
			onValueChange: (details) => direction = details.value[0] === 'rtl' ? 'rtl' : 'ltr',
			class: viewMode === 'preview' ? 'block' : 'hidden',
			children: ($$renderer) => {
				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'rtl',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'Toggle LTR/RTL Modes',
						'aria-label': 'Toggle LTR/RTL Modes',
						children: ($$renderer) => {
							$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="size-4"><text x="8" y="12" text-anchor="middle" font-size="9" font-weight="bold" font-family="sans-serif">${$.escape(direction.toUpperCase())}</text></svg>`);
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

		$$renderer.push(`<!----> `);

		ToggleGroup($$renderer, {
			value: [customizeMode],
			onValueChange: (details) => customizeMode = details.value[0],
			class: viewMode === 'preview' ? 'block' : 'hidden',
			children: ($$renderer) => {
				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'customize',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'Customize',
						'aria-label': 'Customize',
						children: ($$renderer) => {
							PaletteIcon($$renderer, { class: 'size-4' });
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

		$$renderer.push(`<!----> `);

		if (framework) {
			$$renderer.push('<!--[0-->');
			OpenInStackblitz($$renderer, { framework, files });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></header> <div${$.attr_class(`border-b border-surface-200-800 p-3 flex items-center gap-3 ${viewMode === 'preview' && customizeMode === 'customize' ? 'block' : 'hidden'}`)}><!--[-->`);

		const each_array = $.ensure_array_like(presets);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let preset = each_array[i];

			$$renderer.push(`<button type="button"${$.attr_class(`flex-1 w-full aspect-square rounded-full hover:brightness-110 ${$.stringify(preset)}`, void 0, {
				'border': [0, 1].includes(i),
				'border-surface-200-800': [0, 1].includes(i)
			})}><span class="sr-only">${$.escape(preset)}</span></button>`);
		}

		$$renderer.push(`<!--]--></div> <div${$.attr('dir', direction)}${$.attr_class(`p-8 flex justify-center items-center ${$.stringify(activePreset)} ${viewMode === 'preview' && children ? 'block' : 'hidden'}`)}>`);

		LocaleProvider($$renderer, {
			locale: direction === 'ltr' ? 'en-US' : 'ar-SA',
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Tabs($$renderer, {
			defaultValue: fileEntries()[0]?.[0],
			class: `p-3 ${viewMode === 'code' && files ? 'block' : 'hidden'}`,
			children: ($$renderer) => {
				if (fileEntries().length > 1) {
					$$renderer.push('<!--[0-->');

					if (Tabs.List) {
						$$renderer.push('<!--[-->');

						Tabs.List($$renderer, {
							class: 'overflow-x-auto',
							children: ($$renderer) => {
								if (files) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array_1 = $.ensure_array_like(fileEntries());

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let [file] = each_array_1[$$index_1];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: file,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(file)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Tabs.Indicator) {
									$$renderer.push('<!--[-->');
									Tabs.Indicator($$renderer, {});
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_2 = $.ensure_array_like(fileEntries());

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let [file, content] = each_array_2[$$index_2];

					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: file,
							children: ($$renderer) => {
								Code($$renderer, { code: content, lang: file.split('.').pop() });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}