import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

import {
	Button,
	CopyButton,
	Dialog,
	Field,
	Menu,
	MenuItem,
	Notification,
	Toggle,
	ToggleGroup,
	ToggleOption,
	Tooltip
} from 'svelte-ux';

import { cls } from '@layerstack/tailwind';
import { examples } from '@layerstack/docs/context';
import { resolveExamplePath } from '@layerstack/docs/content';
import { exampleViewTransitionName } from '@layerstack/docs/utils';
import { untrack } from 'svelte';
import { Code, Json } from '@layerstack/docs/components';
import LucideCode from '~icons/lucide/code';
import LucideFullscreen from '~icons/lucide/fullscreen';
import LucideTable from '~icons/lucide/table';
import LucideFilePen from '~icons/lucide/file-pen';
import LucideGripVertical from '~icons/lucide/grip-vertical';
import LucideImageDown from '~icons/lucide/image-down';
import LucideCopy from '~icons/lucide/copy';
import { page } from '$app/state';
import { openInStackBlitz } from '$lib/utils/stackblitz.svelte';

import {
	downloadImage,
	downloadSvg,
	getChartImageBlob,
	getChartSvgString,
	getSettings
} from 'layerchart';

import { movable } from '$lib/actions/movable';

export default function Example($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const settings = getSettings();

		let {
			component = page.params.name,
			name,
			path,
			showCode = false,
			showLineNumbers = false,
			highlight,
			variant = 'default',
			noResize = false,
			clip = false,
			class: className
		} = $$props;

		// Get example from context (eagerly loaded by layout)
		// Cache context at init time — getContext() must be called during component initialization
		const examplesCtx = examples.get();

		// Use $state + $effect to break potential infinite reactivity loops during HMR
		let example = undefined;

		// Path-based example
		// Component/name-based example
		// Only assign if the reference actually changed to avoid unnecessary downstream reactivity
		// Untrack both the read and write to prevent this effect from depending on its own output
		let containerEl = null;

		let containerWidth = undefined;
		const minWidth = 200;

		/**
		 * Custom JSON replacer (to use with JSON.stringify()) to convert `Date` instances to `new Date()`
		 */
		function replacer(key, value) {
			// TODO: Improve handling of circular structures and handle other data types (Map, Set, etc)
			if (this[key] instanceof Date) {
				return `new Date('${this[key].toISOString()}')`;
			}

			return value;
		}

		function getDataAsString(_data) {
			try {
				// Regular expression to match quoted instantiation (ex. `"new Date(...)"`) and stripe the quotes  (`new Date(...)`)
				const datePattern = /"(new \w+\([^)]*\))"/g;

				return JSON.stringify(_data, replacer, 2).replace(datePattern, '$1');
			} catch(e) {
				console.error('Error capturing value to copy', e);

				return '';
			}
		}

		let ref = null;

		let data = $.derived(() => {
			try {
				return ref?.data;
			} catch {
				return undefined;
			}
		});

		// Ensure component name is always resolved consistently
		const resolvedComponent = $.derived(() => component ?? page.params.name ?? '');

		// Only set view-transition-name on detail pages (when page.params.example matches)
		// This prevents conflicts with ExampleScreenshot on listing pages
		const isDetailPage = $.derived(() => page.params.example === name);

		const viewTransitionName = $.derived(() => isDetailPage() && resolvedComponent() && name
			? exampleViewTransitionName(resolvedComponent(), name)
			: undefined);

		let canResize = $.derived(() => {
			// Prop
			if (typeof noResize === 'boolean') {
				return !noResize;
			}

			// Page setting
			if (page.data.metadata?.resize !== undefined) {
				return page.data.metadata.resize;
			}

			// Check if source has any Chart component has explicit width in
			if (example?.source) {
				const hasExplicitWidth = (/<\w*Chart[^>]*[\s\n]+width=\{[^}]+\}/).test(example.source);

				return !hasExplicitWidth;
			}

			return true;
		});

		let sentinelEl = null;
		let intersected = false;
		const lazy = $.derived(() => !isDetailPage());
		let isVisible = $.derived(() => !lazy() || intersected);

		// $inspect({ component, name, isVisible, intersected, lazy, example });
		let svgUnavailable = false;

		let svgUnavailableTimer;

		function handleSvgDownload() {
			const downloaded = downloadSvg(containerEl, { filename: name ?? component });

			if (!downloaded) {
				clearTimeout(svgUnavailableTimer);
				svgUnavailable = true;
				svgUnavailableTimer = setTimeout(() => svgUnavailable = false, 3000);
			}
		}

		async function handleSvgCopy() {
			const svg = getChartSvgString(containerEl);

			if (!svg) {
				clearTimeout(svgUnavailableTimer);
				svgUnavailable = true;
				svgUnavailableTimer = setTimeout(() => svgUnavailable = false, 3000);

				return;
			}

			await navigator.clipboard.writeText(svg);
		}

		// PNG capture options dialog — used by both Copy as PNG and Export as PNG.
		let pngDialogOpen = false;

		let pngAction = 'copy';
		let pngPixelRatio = 1;
		let pngBackground = 'transparent';

		function openPngDialog(action) {
			pngAction = action;
			pngDialogOpen = true;
		}

		function resolveBackground() {
			if (pngBackground === 'transparent') return undefined;

			// Resolve `surface` to the actual rendered background color so the PNG
			// matches the on-page chrome (and follows the active light/dark theme).
			if (pngBackground === 'surface') {
				return containerEl
					? window.getComputedStyle(containerEl).backgroundColor || undefined
					: undefined;
			}

			return pngBackground;
		}

		async function runPngCapture() {
			const options = { pixelRatio: pngPixelRatio, background: resolveBackground() };

			if (pngAction === 'copy') {
				const blob = await getChartImageBlob(containerEl, options);

				await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
			} else {
				await downloadImage(containerEl, { ...options, filename: name ?? component });
			}

			pngDialogOpen = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cls('example relative', clip && 'overflow-clip', className)))}>`);

			if (example) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cls(variant === 'default' && 'border rounded-t-sm bg-surface-300', !showCode && 'rounded-b-sm')))}><div${$.attr_class($.clsx(cls('relative max-w-full', variant === 'default' && 'p-4 rounded bg-surface-200 shadow-lg')))}${$.attr_style('', {
					width: containerWidth ? `${containerWidth}px` : undefined,
					'view-transition-name': viewTransitionName()
				})}>`);

				if (isVisible()) {
					$$renderer.push('<!--[0-->');

					{
						function failed($$renderer, error, reset) {
							$$renderer.push(`<div class="border border-danger rounded-md bg-danger/5 p-4 text-sm"><div class="font-semibold text-danger mb-2">Example error`);

							if (component && name) {
								$$renderer.push(`<!--[0-->: ${$.escape(component)}/${$.escape(name)}`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <pre class="text-danger/80 whitespace-pre-wrap break-words overflow-auto max-h-60">${$.escape(error)}</pre> `);

							Button($$renderer, {
								variant: 'outline',
								color: 'danger',
								size: 'sm',
								class: 'mt-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Retry`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}

						$$renderer.boundary({ failed }, ($$renderer) => {
							$$renderer.push(`<!--[!-->`);

							{
								$$renderer.push(`<div class="min-h-80 flex items-center justify-center text-surface-content/30">Loading...</div>`);
							}

							$$renderer.push(`<!--]-->`);
						});
					}
				} else {
					$$renderer.push(`<!--[-1--><div class="min-h-80"></div>`);
				}

				$$renderer.push(`<!--]--> `);

				if (canResize()) {
					$$renderer.push(`<!--[0--><div class="absolute top-0 right-0 bottom-0 flex items-center w-3 cursor-ew-resize select-none hover:bg-surface-content/5 transition-opacity screenshot-hidden" title="Drag to resize">`);
					LucideGripVertical($$renderer, { class: 'text-surface-content/50' });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (showCode) {
					$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cls('border border-t-0', showCode && 'rounded-b-sm')))}>`);

					Code($$renderer, {
						source: example.source,
						showLineNumbers,
						highlight,
						class: 'outline-none'
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (variant === 'default') {
					$$renderer.push(`<!--[0--><div class="mt-0.5">`);

					if (example.source) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							icon: LucideCode,
							class: 'text-surface-content/70 py-1',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(showCode ? 'Hide' : '')} Code`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (data()) {
						$$renderer.push('<!--[0-->');

						Toggle($$renderer, {
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { on: open, toggle, toggleOff }) => {
									Button($$renderer, {
										icon: LucideTable,
										class: 'text-surface-content/70 py-1',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Data`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Dialog($$renderer, {
										open,
										class: 'max-h-[98dvh] md:max-h-[90dvh] w-160 max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]',
										children: ($$renderer) => {
											$$renderer.push(`<div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4"><div class="overflow-auto"><div class="text-lg font-semibold">Chart data</div></div> `);

											Tooltip($$renderer, {
												title: 'Copy',
												children: ($$renderer) => {
													CopyButton($$renderer, {
														value: () => getDataAsString(data()),
														variant: 'fill-light',
														color: 'primary'
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div> `);
											Json($$renderer, { value: data(), class: 'border-t' });
											$$renderer.push(`<!---->`);
										},

										$$slots: {
											default: true,
											actions: ($$renderer) => {
												$$renderer.push(`<div slot="actions">`);

												Button($$renderer, {
													variant: 'fill',
													color: 'primary',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Close`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></div>`);
											}
										}
									});

									$$renderer.push(`<!---->`);
								}
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (page.params.example == null && component && name) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							href: `/docs/components/${$.stringify(component)}/${$.stringify(name)}`,
							icon: LucideFullscreen,
							class: 'text-surface-content/70 py-1',
							children: ($$renderer) => {
								$$renderer.push(`<!---->View`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (component && name) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							icon: LucideFilePen,
							class: 'text-surface-content/70 py-1',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Edit`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								Button($$renderer, {
									icon: LucideImageDown,
									class: 'text-surface-content/70 py-1',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Export `);

										Menu($$renderer, {
											open,
											placement: 'bottom-start',
											classes: { menu: 'p-1' },
											children: ($$renderer) => {
												MenuItem($$renderer, {
													icon: LucideCopy,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Copy as PNG`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												MenuItem($$renderer, {
													icon: LucideImageDown,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Export as PNG`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												if (settings.layer !== 'canvas') {
													$$renderer.push('<!--[0-->');

													MenuItem($$renderer, {
														icon: LucideCopy,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Copy as SVG`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													MenuItem($$renderer, {
														icon: LucideImageDown,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Export as SVG`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}
						}
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="border border-danger bg-danger/5 text-danger px-4 py-2 rounded-md">Example <span class="font-bold">\`${$.escape(path ?? name)}\`</span> `);

				if (component && !path) {
					$$renderer.push(`<!--[0-->for <span class="font-bold">\`${$.escape(component)}\`</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> not found.</div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (svgUnavailable) {
				$$renderer.push(`<!--[0--><div class="fixed bottom-4 right-4 z-50">`);

				Notification($$renderer, {
					description: 'SVG is not available for Canvas-only charts',
					color: 'warning',
					closeIcon: true
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Dialog($$renderer, {
				class: 'max-w-md',
				get open() {
					return pngDialogOpen;
				},

				set open($$value) {
					pngDialogOpen = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="grid gap-4 p-4">`);

					Field($$renderer, {
						label: 'Resolution',
						dense: true,
						children: ($$renderer) => {
							ToggleGroup($$renderer, {
								variant: 'outline',
								size: 'sm',
								get value() {
									return pngPixelRatio;
								},

								set value($$value) {
									pngPixelRatio = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									ToggleOption($$renderer, {
										value: 1,
										children: ($$renderer) => {
											$$renderer.push(`<!---->1×`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ToggleOption($$renderer, {
										value: 2,
										children: ($$renderer) => {
											$$renderer.push(`<!---->2×`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ToggleOption($$renderer, {
										value: 3,
										children: ($$renderer) => {
											$$renderer.push(`<!---->3×`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Field($$renderer, {
						label: 'Background',
						dense: true,
						children: ($$renderer) => {
							ToggleGroup($$renderer, {
								variant: 'outline',
								size: 'sm',
								get value() {
									return pngBackground;
								},

								set value($$value) {
									pngBackground = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									ToggleOption($$renderer, {
										value: 'transparent',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Transparent`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ToggleOption($$renderer, {
										value: 'surface',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Surface`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ToggleOption($$renderer, {
										value: 'white',
										children: ($$renderer) => {
											$$renderer.push(`<!---->White`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ToggleOption($$renderer, {
										value: 'black',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Black`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						$$renderer.push(`<div slot="title">${$.escape(pngAction === 'copy' ? 'Copy as PNG' : 'Export as PNG')}</div>`);
					},

					actions: ($$renderer) => {
						$$renderer.push(`<div slot="actions">`);

						Button($$renderer, {
							variant: 'fill',
							color: 'primary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(pngAction === 'copy' ? 'Copy' : 'Export')}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Cancel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}