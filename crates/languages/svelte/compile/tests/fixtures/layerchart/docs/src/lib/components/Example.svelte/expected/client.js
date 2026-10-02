import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="border border-danger rounded-md bg-danger/5 p-4 text-sm"><div class="font-semibold text-danger mb-2">Example error<!></div> <pre class="text-danger/80 whitespace-pre-wrap break-words overflow-auto max-h-60"> </pre> <!></div>`);
var root_1 = $.from_html(`<div class="min-h-80 flex items-center justify-center text-surface-content/30">Loading...</div>`);
var root_2 = $.from_html(`<div class="min-h-80"></div>`);
var root_3 = $.from_html(`<div class="absolute top-0 right-0 bottom-0 flex items-center w-3 cursor-ew-resize select-none hover:bg-surface-content/5 transition-opacity screenshot-hidden" title="Drag to resize"><!></div>`);
var root_4 = $.from_html(`<div><!></div>`);
var root_5 = $.from_html(`<div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4"><div class="overflow-auto"><div class="text-lg font-semibold">Chart data</div></div> <!></div> <!>`, 1);
var root_6 = $.from_html(`<div slot="actions"><!></div>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);
var root_9 = $.from_html(`Export <!>`, 1);
var root_10 = $.from_html(`<div class="mt-0.5"><!> <!> <!> <!> <!></div>`);
var root_11 = $.from_html(`<div><div><!> <!></div></div> <!> <!>`, 1);
var root_12 = $.from_html(`for <span class="font-bold"> </span>`, 1);
var root_13 = $.from_html(`<div class="border border-danger bg-danger/5 text-danger px-4 py-2 rounded-md">Example <span class="font-bold"> </span> <!> not found.</div>`);
var root_14 = $.from_html(`<div class="fixed bottom-4 right-4 z-50"><!></div>`);
var root_15 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_16 = $.from_html(`<div class="grid gap-4 p-4"><!> <!></div>`);
var root_17 = $.from_html(`<div slot="title"> </div>`);
var root_18 = $.from_html(`<div slot="actions"><!> <!></div>`);
var root_19 = $.from_html(`<div><!></div> <!> <!>`, 1);

export default function Example($$anchor, $$props) {
	$.push($$props, true);

	const settings = getSettings();

	let component = $.prop($$props, 'component', 19, () => page.params.name),
		showCode = $.prop($$props, 'showCode', 7, false),
		showLineNumbers = $.prop($$props, 'showLineNumbers', 3, false),
		variant = $.prop($$props, 'variant', 3, 'default'),
		noResize = $.prop($$props, 'noResize', 3, false),
		clip = $.prop($$props, 'clip', 3, false);

	// Get example from context (eagerly loaded by layout)
	// Cache context at init time — getContext() must be called during component initialization
	const examplesCtx = examples.get();

	// Use $state + $effect to break potential infinite reactivity loops during HMR
	let example = $.state(undefined);

	$.user_effect(() => {
		const current = examplesCtx?.current;
		let next;

		if ($$props.path) {
			// Path-based example
			const resolvedPath = resolveExamplePath($$props.path, page.url.pathname, page.url.pathname.startsWith('/docs/guides/') ? 'guides' : 'components');

			next = current?.['__path__']?.[resolvedPath];
		} else if (component() && $$props.name) {
			// Component/name-based example
			next = current?.[component()]?.[$$props.name];
		} else {
			next = undefined;
		}

		// Only assign if the reference actually changed to avoid unnecessary downstream reactivity
		// Untrack both the read and write to prevent this effect from depending on its own output
		untrack(() => {
			if ($.get(example) !== next) {
				$.set(example, next, true);
			}
		});
	});

	let containerEl = $.state(null);
	let containerWidth = $.state(undefined);
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

	let ref = $.state(null);

	let data = $.derived(() => {
		try {
			return $.get(ref)?.data;
		} catch {
			return undefined;
		}
	});

	// Ensure component name is always resolved consistently
	const resolvedComponent = $.derived(() => component() ?? page.params.name ?? '');

	// Only set view-transition-name on detail pages (when page.params.example matches)
	// This prevents conflicts with ExampleScreenshot on listing pages
	const isDetailPage = $.derived(() => page.params.example === $$props.name);

	const viewTransitionName = $.derived(() => $.get(isDetailPage) && $.get(resolvedComponent) && $$props.name
		? exampleViewTransitionName($.get(resolvedComponent), $$props.name)
		: undefined);

	let canResize = $.derived(() => {
		// Prop
		if (typeof noResize() === 'boolean') {
			return !noResize();
		}

		// Page setting
		if (page.data.metadata?.resize !== undefined) {
			return page.data.metadata.resize;
		}

		// Check if source has any Chart component has explicit width in
		if ($.get(example)?.source) {
			const hasExplicitWidth = (/<\w*Chart[^>]*[\s\n]+width=\{[^}]+\}/).test($.get(example).source);

			return !hasExplicitWidth;
		}

		return true;
	});

	let sentinelEl = $.state(null);
	let intersected = $.state(false);
	const lazy = $.derived(() => !$.get(isDetailPage));
	let isVisible = $.derived(() => !$.get(lazy) || $.get(intersected));

	$.user_effect(() => {
		if (!$.get(lazy) || !$.get(sentinelEl)) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					$.set(intersected, true);
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe($.get(sentinelEl));

		return () => observer.disconnect();
	});

	// $inspect({ component, name, isVisible, intersected, lazy, example });
	let svgUnavailable = $.state(false);

	let svgUnavailableTimer;

	function handleSvgDownload() {
		const downloaded = downloadSvg($.get(containerEl), { filename: $$props.name ?? component() });

		if (!downloaded) {
			clearTimeout(svgUnavailableTimer);
			$.set(svgUnavailable, true);
			svgUnavailableTimer = setTimeout(() => $.set(svgUnavailable, false), 3000);
		}
	}

	async function handleSvgCopy() {
		const svg = getChartSvgString($.get(containerEl));

		if (!svg) {
			clearTimeout(svgUnavailableTimer);
			$.set(svgUnavailable, true);
			svgUnavailableTimer = setTimeout(() => $.set(svgUnavailable, false), 3000);

			return;
		}

		await navigator.clipboard.writeText(svg);
	}

	// PNG capture options dialog — used by both Copy as PNG and Export as PNG.
	let pngDialogOpen = $.state(false);

	let pngAction = $.state('copy');
	let pngPixelRatio = $.state(1);
	let pngBackground = $.state('transparent');

	function openPngDialog(action) {
		$.set(pngAction, action, true);
		$.set(pngDialogOpen, true);
	}

	function resolveBackground() {
		if ($.get(pngBackground) === 'transparent') return undefined;

		// Resolve `surface` to the actual rendered background color so the PNG
		// matches the on-page chrome (and follows the active light/dark theme).
		if ($.get(pngBackground) === 'surface') {
			return $.get(containerEl)
				? window.getComputedStyle($.get(containerEl)).backgroundColor || undefined
				: undefined;
		}

		return $.get(pngBackground);
	}

	async function runPngCapture() {
		const options = {
			pixelRatio: $.get(pngPixelRatio),
			background: resolveBackground()
		};

		if ($.get(pngAction) === 'copy') {
			const blob = await getChartImageBlob($.get(containerEl), options);

			await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
		} else {
			await downloadImage($.get(containerEl), { ...options, filename: $$props.name ?? component() });
		}

		$.set(pngDialogOpen, false);
	}

	var fragment = root_19();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_1 = root_11();
			var div_1 = $.first_child(fragment_1);
			var div_2 = $.child(div_1);
			let styles;
			var node_1 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						const failed = ($$anchor, error = $.noop, reset = $.noop) => {
							var div_3 = root();
							var div_4 = $.child(div_3);
							var node_3 = $.sibling($.child(div_4));

							{
								var consequent = ($$anchor) => {
									var text = $.text();

									$.template_effect(() => $.set_text(text, `: ${component() ?? ''}/${$$props.name ?? ''}`));
									$.append($$anchor, text);
								};

								$.if(node_3, ($$render) => {
									if (component() && $$props.name) $$render(consequent);
								});
							}

							$.reset(div_4);

							var pre = $.sibling(div_4, 2);
							var text_1 = $.only_child(pre, true);
							var node_4 = $.sibling(pre, 2);

							Button(node_4, {
								variant: 'outline',
								color: 'danger',
								size: 'sm',
								class: 'mt-2',
								$$events: {
									click: function (...$$args) {
										reset()?.apply(this, $$args);
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Retry');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div_3);
							$.template_effect(() => $.set_text(text_1, error()));
							$.append($$anchor, div_3);
						};

						const pending = ($$anchor) => {
							var div_5 = root_1();

							$.append($$anchor, div_5);
						};

						$.boundary(node_2, { failed, pending }, ($$anchor) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => $.get(example).component, ($$anchor, example_component) => {
								$.bind_this(example_component($$anchor, {}), ($$value) => $.set(ref, $$value, true), () => $.get(ref));
							});

							$.append($$anchor, fragment_4);
						});
					}

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div_6 = root_2();

					$.bind_this(div_6, ($$value) => $.set(sentinelEl, $$value), () => $.get(sentinelEl));
					$.append($$anchor, div_6);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isVisible)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_6 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_7 = root_3();
					var node_7 = $.child(div_7);

					LucideGripVertical(node_7, { class: 'text-surface-content/50' });
					$.reset(div_7);

					$.action(div_7, ($$node, $$action_arg) => movable?.($$node, $$action_arg), () => ({
						axis: 'x',
						onMove: (e) => {
							const newWidth = ($.get(containerWidth) ?? $.get(containerEl)?.offsetWidth ?? 0) + e.detail.dx;

							if (newWidth >= minWidth) {
								$.set(containerWidth, newWidth);
							}
						}
					}));

					$.append($$anchor, div_7);
				};

				$.if(node_6, ($$render) => {
					if ($.get(canResize)) $$render(consequent_2);
				});
			}

			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
			$.reset(div_1);

			var node_8 = $.sibling(div_1, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_8 = root_4();
					var node_9 = $.child(div_8);

					Code(node_9, {
						get source() {
							return $.get(example).source;
						},

						get showLineNumbers() {
							return showLineNumbers();
						},

						get highlight() {
							return $$props.highlight;
						},
						class: 'outline-none'
					});

					$.reset(div_8);

					$.template_effect(($0) => $.set_class(div_8, 1, $0), [
						() => $.clsx(cls('border border-t-0', showCode() && 'rounded-b-sm'))
					]);

					$.transition(3, div_8, () => slide);
					$.append($$anchor, div_8);
				};

				$.if(node_8, ($$render) => {
					if (showCode()) $$render(consequent_3);
				});
			}

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_9 = root_10();
					var node_11 = $.child(div_9);

					{
						var consequent_4 = ($$anchor) => {
							Button($$anchor, {
								get icon() {
									return LucideCode;
								},
								class: 'text-surface-content/70 py-1',
								$$events: { click: () => showCode(!showCode()) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, `${showCode() ? 'Hide' : ''} Code`));
									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_11, ($$render) => {
							if ($.get(example).source) $$render(consequent_4);
						});
					}

					var node_12 = $.sibling(node_11, 2);

					{
						var consequent_5 = ($$anchor) => {
							Toggle($$anchor, {
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const open = $.derived(() => $$slotProps.on);
										const toggle = $.derived(() => $$slotProps.toggle);
										const toggleOff = $.derived(() => $$slotProps.toggleOff);
										var fragment_8 = root_7();
										var node_13 = $.first_child(fragment_8);

										Button(node_13, {
											get icon() {
												return LucideTable;
											},
											class: 'text-surface-content/70 py-1',
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Data');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_14 = $.sibling(node_13, 2);

										Dialog(node_14, {
											get open() {
												return $.get(open);
											},
											class: 'max-h-[98dvh] md:max-h-[90dvh] w-160 max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]',
											$$events: {
												close: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_5();
												var div_10 = $.first_child(fragment_9);
												var node_15 = $.sibling($.child(div_10), 2);

												Tooltip(node_15, {
													title: 'Copy',
													children: ($$anchor, $$slotProps) => {
														CopyButton($$anchor, {
															value: () => getDataAsString($.get(data)),
															variant: 'fill-light',
															color: 'primary'
														});
													},
													$$slots: { default: true }
												});

												$.reset(div_10);

												var node_16 = $.sibling(div_10, 2);

												Json(node_16, {
													get value() {
														return $.get(data);
													},
													class: 'border-t'
												});

												$.append($$anchor, fragment_9);
											},

											$$slots: {
												default: true,
												actions: ($$anchor, $$slotProps) => {
													var div_11 = root_6();
													var node_17 = $.child(div_11);

													Button(node_17, {
														variant: 'fill',
														color: 'primary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Close');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});

													$.reset(div_11);
													$.append($$anchor, div_11);
												}
											}
										});

										$.append($$anchor, fragment_8);
									}
								}
							});
						};

						$.if(node_12, ($$render) => {
							if ($.get(data)) $$render(consequent_5);
						});
					}

					var node_18 = $.sibling(node_12, 2);

					{
						var consequent_6 = ($$anchor) => {
							Button($$anchor, {
								get href() {
									return `/docs/components/${component() ?? ''}/${$$props.name ?? ''}`;
								},

								get icon() {
									return LucideFullscreen;
								},
								class: 'text-surface-content/70 py-1',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('View');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_18, ($$render) => {
							if (page.params.example == null && component() && $$props.name) $$render(consequent_6);
						});
					}

					var node_19 = $.sibling(node_18, 2);

					{
						var consequent_7 = ($$anchor) => {
							Button($$anchor, {
								get icon() {
									return LucideFilePen;
								},
								class: 'text-surface-content/70 py-1',
								$$events: { click: () => openInStackBlitz(component(), $$props.name) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Edit');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_19, ($$render) => {
							if (component() && $$props.name) $$render(consequent_7);
						});
					}

					var node_20 = $.sibling(node_19, 2);

					Toggle(node_20, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);

								Button($$anchor, {
									get icon() {
										return LucideImageDown;
									},
									class: 'text-surface-content/70 py-1',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_14 = root_9();
										var node_21 = $.sibling($.first_child(fragment_14));

										Menu(node_21, {
											get open() {
												return $.get(open);
											},
											placement: 'bottom-start',
											classes: { menu: 'p-1' },
											$$events: {
												close: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root_8();
												var node_22 = $.first_child(fragment_15);

												MenuItem(node_22, {
													get icon() {
														return LucideCopy;
													},
													$$events: { click: () => openPngDialog('copy') },
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Copy as PNG');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});

												var node_23 = $.sibling(node_22, 2);

												MenuItem(node_23, {
													get icon() {
														return LucideImageDown;
													},
													$$events: { click: () => openPngDialog('export') },
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Export as PNG');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});

												var node_24 = $.sibling(node_23, 2);

												{
													var consequent_8 = ($$anchor) => {
														var fragment_16 = root_7();
														var node_25 = $.first_child(fragment_16);

														MenuItem(node_25, {
															get icon() {
																return LucideCopy;
															},
															$$events: { click: handleSvgCopy },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text('Copy as SVG');

																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});

														var node_26 = $.sibling(node_25, 2);

														MenuItem(node_26, {
															get icon() {
																return LucideImageDown;
															},
															$$events: { click: handleSvgDownload },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('Export as SVG');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_16);
													};

													$.if(node_24, ($$render) => {
														if (settings.layer !== 'canvas') $$render(consequent_8);
													});
												}

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							}
						}
					});

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				$.if(node_10, ($$render) => {
					if (variant() === 'default') $$render(consequent_9);
				});
			}

			$.template_effect(
				($0, $1) => {
					$.set_class(div_1, 1, $0);
					$.set_class(div_2, 1, $1);

					styles = $.set_style(div_2, '', styles, {
						width: $.get(containerWidth) ? `${$.get(containerWidth)}px` : undefined,
						'view-transition-name': $.get(viewTransitionName)
					});
				},
				[
					() => $.clsx(cls(variant() === 'default' && 'border rounded-t-sm bg-surface-300', !showCode() && 'rounded-b-sm')),
					() => $.clsx(cls('relative max-w-full', variant() === 'default' && 'p-4 rounded bg-surface-200 shadow-lg'))
				]
			);

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var div_12 = root_13();
			var span = $.sibling($.child(div_12));
			var text_12 = $.only_child(span);
			var node_27 = $.sibling(span, 2);

			{
				var consequent_11 = ($$anchor) => {
					var fragment_17 = root_12();
					var span_1 = $.sibling($.first_child(fragment_17));
					var text_13 = $.only_child(span_1);

					$.template_effect(() => $.set_text(text_13, `\`${component() ?? ''}\``));
					$.append($$anchor, fragment_17);
				};

				$.if(node_27, ($$render) => {
					if (component() && !$$props.path) $$render(consequent_11);
				});
			}

			$.next();
			$.reset(div_12);
			$.template_effect(() => $.set_text(text_12, `\`${$$props.path ?? $$props.name ?? ''}\``));
			$.append($$anchor, div_12);
		};

		$.if(node, ($$render) => {
			if ($.get(example)) $$render(consequent_10); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);

	var node_28 = $.sibling(div, 2);

	{
		var consequent_12 = ($$anchor) => {
			var div_13 = root_14();
			var node_29 = $.child(div_13);

			Notification(node_29, {
				description: 'SVG is not available for Canvas-only charts',
				color: 'warning',
				closeIcon: true,
				$$events: { close: () => $.set(svgUnavailable, false) }
			});

			$.reset(div_13);
			$.append($$anchor, div_13);
		};

		$.if(node_28, ($$render) => {
			if ($.get(svgUnavailable)) $$render(consequent_12);
		});
	}

	var node_30 = $.sibling(node_28, 2);

	Dialog(node_30, {
		class: 'max-w-md',
		get open() {
			return $.get(pngDialogOpen);
		},

		set open($$value) {
			$.set(pngDialogOpen, $$value, true);
		},
		$$events: { close: () => $.set(pngDialogOpen, false) },
		children: ($$anchor, $$slotProps) => {
			var div_14 = root_16();
			var node_31 = $.child(div_14);

			Field(node_31, {
				label: 'Resolution',
				dense: true,
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						size: 'sm',
						get value() {
							return $.get(pngPixelRatio);
						},

						set value($$value) {
							$.set(pngPixelRatio, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_8();
							var node_32 = $.first_child(fragment_19);

							ToggleOption(node_32, {
								value: 1,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('1×');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_32, 2);

							ToggleOption(node_33, {
								value: 2,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('2×');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							ToggleOption(node_34, {
								value: 3,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('3×');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_35 = $.sibling(node_31, 2);

			Field(node_35, {
				label: 'Background',
				dense: true,
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						size: 'sm',
						get value() {
							return $.get(pngBackground);
						},

						set value($$value) {
							$.set(pngBackground, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_15();
							var node_36 = $.first_child(fragment_21);

							ToggleOption(node_36, {
								value: 'transparent',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Transparent');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_37 = $.sibling(node_36, 2);

							ToggleOption(node_37, {
								value: 'surface',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Surface');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_38 = $.sibling(node_37, 2);

							ToggleOption(node_38, {
								value: 'white',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('White');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							var node_39 = $.sibling(node_38, 2);

							ToggleOption(node_39, {
								value: 'black',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('Black');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_14);
			$.append($$anchor, div_14);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var div_15 = root_17();
				var text_21 = $.only_child(div_15, true);

				$.template_effect(() => $.set_text(text_21, $.get(pngAction) === 'copy' ? 'Copy as PNG' : 'Export as PNG'));
				$.append($$anchor, div_15);
			},

			actions: ($$anchor, $$slotProps) => {
				var div_16 = root_18();
				var node_40 = $.child(div_16);

				Button(node_40, {
					variant: 'fill',
					color: 'primary',
					$$events: { click: runPngCapture },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_22 = $.text();

						$.template_effect(() => $.set_text(text_22, $.get(pngAction) === 'copy' ? 'Copy' : 'Export'));
						$.append($$anchor, text_22);
					},
					$$slots: { default: true }
				});

				var node_41 = $.sibling(node_40, 2);

				Button(node_41, {
					$$events: { click: () => $.set(pngDialogOpen, false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_23 = $.text('Cancel');

						$.append($$anchor, text_23);
					},
					$$slots: { default: true }
				});

				$.reset(div_16);
				$.append($$anchor, div_16);
			}
		}
	});

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cls('example relative', clip() && 'overflow-clip', $$props.class))
	]);

	$.append($$anchor, fragment);
	$.pop();
}