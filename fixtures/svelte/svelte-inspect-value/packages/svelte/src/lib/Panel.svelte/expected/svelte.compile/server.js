import * as $ from 'svelte/internal/server';
import { BROWSER } from 'esm-env';
import { setContext, untrack } from 'svelte';
import { fade } from 'svelte/transition';
import CollapseStateProvider from './CollapseStateProvider.svelte';
import Node from './components/Node.svelte';
import NodeActionButton from './components/NodeActionButton.svelte';
import PropertyList from './components/PropertyList.svelte';
import { globalValues } from './global.svelte.js';
import { logToConsole } from './hello.svelte.js';
import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js';
import PanelToolbar from './PanelToolbar.svelte';
import Resize from './Resize.svelte';
import { getAllProperties, initialize, sortProps } from './util.js';
import Wrapper from './Wrapper.svelte';
import { SvelteSet } from 'svelte/reactivity';
import { PersistedState } from './util/persisted.svelte.js';

export let globalInspectState = { mounted: new SvelteSet() };

const persistDefaults = { key: 'siv.panel', storage: 'local', syncTabs: false };

function createPersistState(initialValue, persist, persistSync) {
	let opts;

	if (persist === true) {
		opts = persistDefaults;
	} else if (typeof persist === 'string') {
		opts = { ...persistDefaults, key: persist };
	} else if (typeof persist === 'object') {
		opts = { ...persistDefaults, ...persist };
	} else if (persistSync === true) {
		opts = { ...persistDefaults, syncTabs: true };
	} else if (typeof persistSync === 'string') {
		opts = { ...persistDefaults, key: persistSync, syncTabs: true };
	} else if (typeof persistSync === 'object') {
		opts = { ...persistDefaults, ...persistSync, syncTabs: true };
	} else {
		return undefined;
	}

	return new PersistedState(initialValue, opts);
}

export default function Panel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // base props
		// panel props
		// inspect options and element attributes
		id = $.props_id($$renderer);

		let {
			value,
			values,
			name,
			align = 'right full',
			appearance = 'solid',
			open = false,
			opacity = false,
			width = void 0,
			height = void 0,
			hideToolbar = false,
			hideGlobalValues = false,
			resize = true,
			openOnHover = false,
			zIndex = 1000,
			wiggleOnUpdate = true,
			onOpenChange,
			onSettingsChange = () => void 0,
			persist = false,
			persistSync = false,
			children,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let fullScreen = false;
		let hovered = false;
		let flash = false;
		let resizing = false;
		let panelEle = void 0;

		let $$d = $.derived(() => sortProps(rest)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			optionsProps = $.derived(() => $$derived_array()[0]),
			restProps = $.derived(() => $$derived_array()[1]);

		let initialized = false;
		let globalOptions = getGlobalInspectOptions();
		let mergedOptions = $.derived(() => mergeOptions({ ...optionsProps() }, typeof globalOptions === 'function' ? globalOptions() : globalOptions));
		let options = createOptions(() => mergedOptions());
		const handleLabel = $.derived(() => open ? 'close panel' : 'open panel');

		const persistedSettings = createPersistState(
			{ open, align, opacity, appearance, width, height },
			// svelte-ignore state_referenced_locally
			persist,
			// svelte-ignore state_referenced_locally
			persistSync
		);

		function setSettingsFrom(source) {
			align = source.align ?? align;
			open = source.open ?? open;
			appearance = source.appearance ?? appearance;
			opacity = source.opacity ?? opacity;
			width = source.width ?? width;
			height = source.height ?? height;
			settingsChanged();
		}

		let globalEntries = $.derived(() => {
			const entries = [...globalValues.entries()].map(([k, v]) => [k, v.value]);

			return Object.fromEntries(entries);
		});

		let shouldBeOpen = $.derived(() => {
			if (openOnHover) {
				return hovered || open;
			}

			return open;
		});

		let $$d_1 = $.derived(() => {
				let [x, y = 'full'] = align.split(' ');

				if (['full', 'center'].includes(x)) {
					if (!['top', 'bottom'].includes(y)) {
						y = 'top';
					}
				}

				if (['full', 'middle'].includes(y)) {
					if (!['right', 'left'].includes(x)) {
						x = 'right';
					}
				}

				return [
					x,
					y,
					x === 'full' ? 'full-x' : x,
					y === 'full' ? 'full-y' : y
				];
			}),
			$$derived_array_1 = $.derived(() => $.to_array($$d_1(), 4)),
			xPos = $.derived(() => $$derived_array_1()[0]),
			yPos = $.derived(() => $.fallback($$derived_array_1()[1], 'full')),
			xPosClassname = $.derived(() => $$derived_array_1()[2]),
			yPosClassname = $.derived(() => $$derived_array_1()[3]);

		let keys = $.derived(() => {
			if (values) return getAllProperties(values);

			return [];
		});

		let resizableHandles = $.derived(() => {
			const ret = [];

			if (!resize) return [];

			if (['bottom', 'middle'].includes(yPos())) {
				ret.push('top');
			}

			if (['right', 'center'].includes(xPos())) {
				ret.push('left');
			}

			if (['left', 'center'].includes(xPos())) {
				ret.push('right');
			}

			if (['top', 'middle'].includes(yPos())) {
				ret.push('bottom');
			}

			return ret;
		});

		let useWidth = $.derived(() => resizableHandles().includes('left') || resizableHandles().includes('right'));
		let useHeight = $.derived(() => resizableHandles().includes('top') || resizableHandles().includes('bottom'));
		let widthPx = $.derived(() => useWidth() && width && !fullScreen ? `${width}px` : undefined);
		let heightPx = $.derived(() => useHeight() && height && !fullScreen ? `${height}px` : undefined);

		let $$d_2 = $.derived(() => options.value),
			theme = $.derived(() => $$d_2().theme),
			noanimate = $.derived(() => $$d_2().noanimate),
			animRate = $.derived(() => $$d_2().animRate),
			borderless = $.derived(() => $$d_2().borderless),
			heading = $.derived(() => $$d_2().heading),
			onCollapseChange = $.derived(() => $$d_2().onCollapseChange),
			onLog = $.derived(() => $$d_2().onLog);

		const renderIfValue = $.derived(() => typeof options.value.renderIf === 'function'
			? Boolean(options.value.renderIf())
			: Boolean(options.value.renderIf));

		let shouldRender = $.derived(() => renderIfValue() && (persist ? BROWSER : true));
		let wrapperClasses = $.derived(() => [theme(), borderless() && 'borderless']);

		setContext(Symbol.for('siv.fixed'), true);
		initialize(options);

		function oninspectvaluechange() {
			if (flash) return;

			flash = true;

			setTimeout(
				() => {
					flash = false;
				},
				500
			);
		}

		function onAlignChange(x, y) {
			align = `${x} ${y}`;
			settingsChanged(['align']);
		}

		function onHandleClick() {
			open = !open;
			hovered = false;
			onOpenChange?.(open);
			settingsChanged(['open']);
		}

		function toggleOpacity() {
			opacity = !opacity;
			settingsChanged(['opacity']);
		}

		function settingsChanged(
			key = [
				'opacity',
				'appearance',
				'width',
				'height',
				'open',
				'opacity'
			]
		) {
			if (persistedSettings) {
				persistedSettings.current = { open, appearance, opacity, align, width, height };
			}

			onSettingsChange?.({ open, align, opacity, appearance, width, height }, key);
		}

		function log() {
			if (onLog()) {
				onLog()(values, 'values', ['Inspect.Panel#values']);
			} else {
				logToConsole(['Inspect.Panel#values'], values, 'values');
			}
		}

		function logGlobalValues() {
			if (onLog()) {
				onLog()(globalValues, 'globalValues', ['globalValues']);
			} else {
				logToConsole(['Inspect.Panel'], Object.fromEntries(globalValues.entries()), 'globalValues');
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (shouldRender()) {
				$$renderer.push(`<!--[0--><aside${$.attributes(
					{
						class: $.clsx([
							'inspect-panel',
							theme(),
							fullScreen ? 'full' : [xPosClassname(), yPosClassname()],
							appearance,
							borderless() && 'borderless',
							noanimate() && 'noanimate',
							opacity && 'opacity',
							flash && wiggleOnUpdate && !hideGlobalValues && 'flash',
							shouldBeOpen() && 'open',
							openOnHover && 'hoverable',
							resizing && 'resizing',
							className
						]),
						...restProps()
					},
					'svelte-1axlpar',
					void 0,
					{
						width: widthPx(),
						height: heightPx(),
						'z-index': zIndex,
						'--transition-rate': animRate()
					}
				)}>`);

				if (panelEle) {
					$$renderer.push('<!--[0-->');

					Resize($$renderer, {
						handles: resizableHandles(),
						ele: panelEle,
						enabled: resize,
						onResize: (key) => settingsChanged([key]),
						get width() {
							return width;
						},

						set width($$value) {
							width = $$value;
							$$settled = false;
						},

						get height() {
							return height;
						},

						set height($$value) {
							height = $$value;
							$$settled = false;
						},

						get resizing() {
							return resizing;
						},

						set resizing($$value) {
							resizing = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <button class="handle svelte-1axlpar" type="button"${$.attr('aria-label', handleLabel())}${$.attr('title', handleLabel())}><div class="caret svelte-1axlpar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="svelte-1axlpar"><path stroke="currentColor"${$.attr('stroke-width', openOnHover ? open ? 0 : 80 : 0)} stroke-linecap="butt" stroke-linejoin="bevel"${$.attr('fill', openOnHover
					? open ? 'currentColor' : 'transparent'
					: 'currentColor')} d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37" class="svelte-1axlpar"></path></svg></div></button> `);

				if (!hideToolbar) {
					$$renderer.push('<!--[0-->');

					PanelToolbar($$renderer, {
						xPos: xPos(),
						yPos: yPos(),
						onAlignChange,
						opacity,
						toggleOpacity,
						settingsChanged,
						showResetButton: Boolean(resize && (widthPx() || heightPx())),
						onReset: () => {
							width = undefined;
							height = undefined;
							settingsChanged(['width', 'height']);
						},

						get fullScreen() {
							return fullScreen;
						},

						set fullScreen($$value) {
							fullScreen = $$value;
							$$settled = false;
						},

						get appearance() {
							return appearance;
						},

						set appearance($$value) {
							appearance = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (value || name || keys().length && values) {
					$$renderer.push('<!--[0-->');

					CollapseStateProvider($$renderer, {
						onCollapseChange: onCollapseChange(),
						value,
						name,
						keys: keys(),
						values,
						children: ($$renderer) => {
							Wrapper($$renderer, {
								class: wrapperClasses(),
								heading: heading(),
								style: hideToolbar && appearance === 'dense' ? 'border-top: none' : '',
								showExpandCollapse: values != null,
								onlog: log,
								children: ($$renderer) => {
									if (values && keys().length) {
										$$renderer.push('<!--[0-->');
										PropertyList($$renderer, { value: values, keys: keys() });
									} else if (name || value) {
										$$renderer.push('<!--[1-->');
										Node($$renderer, { value, key: name });
									} else {
										$$renderer.push(`<!--[-1--><div style="color: var(--_comment-color); text-align: center" class="svelte-1axlpar">no value</div>`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (globalValues.size > 0 && !hideGlobalValues) {
					$$renderer.push('<!--[0-->');

					CollapseStateProvider($$renderer, {
						onCollapseChange: onCollapseChange(),
						values: globalEntries(),
						keys: Array.from(globalValues.keys()),
						children: ($$renderer) => {
							{
								function heading($$renderer) {
									$$renderer.push(`<!---->global values`);
								}

								function headingExtra($$renderer) {
									NodeActionButton($$renderer, {
										onclick: () => globalValues.clear(),
										children: ($$renderer) => {
											$$renderer.push(`<!---->clear`);
										},
										$$slots: { default: true }
									});
								}

								Wrapper($$renderer, {
									class: wrapperClasses(),
									showExpandCollapse: true,
									onlog: logGlobalValues,
									heading,
									headingExtra,
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(globalValues);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let [key, entry] = each_array[$$index];

											Node($$renderer, { note: entry.note, key, value: entry.value });
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { heading: true, headingExtra: true, default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (children) {
					$$renderer.push('<!--[0-->');
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></aside>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { align, appearance, open, opacity, width, height });
	});
}