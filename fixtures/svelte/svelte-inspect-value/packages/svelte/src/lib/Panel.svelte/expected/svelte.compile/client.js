import 'svelte/internal/disclose-version';
import { SvelteSet } from 'svelte/reactivity';
import { PersistedState } from './util/persisted.svelte.js';
import * as $ from 'svelte/internal/client';
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

export let globalInspectState = $.proxy({ mounted: new SvelteSet() });

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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'values',
	'name',
	'align',
	'appearance',
	'open',
	'opacity',
	'width',
	'height',
	'hideToolbar',
	'hideGlobalValues',
	'resize',
	'openOnHover',
	'zIndex',
	'wiggleOnUpdate',
	'onOpenChange',
	'onSettingsChange',
	'persist',
	'persistSync',
	'children',
	'class'
]);

var root = $.from_html(`<div style="color: var(--_comment-color); text-align: center" class="svelte-1axlpar">no value</div>`);
var root_1 = $.from_html(`<aside><!> <button class="handle svelte-1axlpar" type="button"><div class="caret svelte-1axlpar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="svelte-1axlpar"><path stroke="currentColor" stroke-linecap="butt" stroke-linejoin="bevel" d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37" class="svelte-1axlpar"></path></svg></div></button> <!> <!> <!> <!></aside>`);

export default function Panel($$anchor, $$props) {
	const // base props
	// panel props
	// inspect options and element attributes
	id = $.props_id();

	$.push($$props, true);

	let align = $.prop($$props, 'align', 15, 'right full'),
		appearance = $.prop($$props, 'appearance', 15, 'solid'),
		open = $.prop($$props, 'open', 15, false),
		opacity = $.prop($$props, 'opacity', 15, false),
		width = $.prop($$props, 'width', 15),
		height = $.prop($$props, 'height', 15),
		hideToolbar = $.prop($$props, 'hideToolbar', 3, false),
		hideGlobalValues = $.prop($$props, 'hideGlobalValues', 3, false),
		resize = $.prop($$props, 'resize', 3, true),
		openOnHover = $.prop($$props, 'openOnHover', 3, false),
		zIndex = $.prop($$props, 'zIndex', 3, 1000),
		wiggleOnUpdate = $.prop($$props, 'wiggleOnUpdate', 3, true),
		onSettingsChange = $.prop($$props, 'onSettingsChange', 3, () => void 0),
		persist = $.prop($$props, 'persist', 3, false),
		persistSync = $.prop($$props, 'persistSync', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	let fullScreen = $.state(false);
	let hovered = $.state(false);
	let flash = $.state(false);
	let resizing = $.state(false);
	let panelEle = $.state(void 0);

	let $$d = $.derived(() => sortProps(rest)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		optionsProps = $.derived(() => $.get($$array)[0]),
		restProps = $.derived(() => $.get($$array)[1]);

	let initialized = false;
	let globalOptions = getGlobalInspectOptions();
	let mergedOptions = $.derived(() => mergeOptions({ ...$.get(optionsProps) }, typeof globalOptions === 'function' ? globalOptions() : globalOptions));
	let options = createOptions(() => $.get(mergedOptions));
	const handleLabel = $.derived(() => open() ? 'close panel' : 'open panel');

	const persistedSettings = createPersistState(
		{
			open: open(),
			align: align(),
			opacity: opacity(),
			appearance: appearance(),
			width: width(),
			height: height()
		},
		// svelte-ignore state_referenced_locally
		persist(),
		// svelte-ignore state_referenced_locally
		persistSync()
	);

	function setSettingsFrom(source) {
		align(source.align ?? align());
		open(source.open ?? open());
		appearance(source.appearance ?? appearance());
		opacity(source.opacity ?? opacity());
		width(source.width ?? width());
		height(source.height ?? height());
		settingsChanged();
	}

	$.user_pre_effect(() => {
		if ((persist() || persistSync()) && !initialized && persistedSettings) {
			setSettingsFrom(persistedSettings.current);
			initialized = true;
		}
	});

	let globalEntries = $.derived(() => {
		const entries = [...globalValues.entries()].map(([k, v]) => [k, v.value]);

		return Object.fromEntries(entries);
	});

	let shouldBeOpen = $.derived(() => {
		if (openOnHover()) {
			return $.get(hovered) || open();
		}

		return open();
	});

	let $$d_1 = $.derived(() => {
			let [x, y = 'full'] = align().split(' ');

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
		$$array_1 = $.derived(() => $.to_array($.get($$d_1), 4)),
		xPos = $.derived(() => $.get($$array_1)[0]),
		yPos = $.derived(() => $.fallback($.get($$array_1)[1], 'full')),
		xPosClassname = $.derived(() => $.get($$array_1)[2]),
		yPosClassname = $.derived(() => $.get($$array_1)[3]);

	let keys = $.derived(() => {
		if ($$props.values) return getAllProperties($$props.values);

		return [];
	});

	let resizableHandles = $.derived(() => {
		const ret = [];

		if (!resize()) return [];

		if (['bottom', 'middle'].includes($.get(yPos))) {
			ret.push('top');
		}

		if (['right', 'center'].includes($.get(xPos))) {
			ret.push('left');
		}

		if (['left', 'center'].includes($.get(xPos))) {
			ret.push('right');
		}

		if (['top', 'middle'].includes($.get(yPos))) {
			ret.push('bottom');
		}

		return ret;
	});

	let useWidth = $.derived(() => $.get(resizableHandles).includes('left') || $.get(resizableHandles).includes('right'));
	let useHeight = $.derived(() => $.get(resizableHandles).includes('top') || $.get(resizableHandles).includes('bottom'));
	let widthPx = $.derived(() => $.get(useWidth) && width() && !$.get(fullScreen) ? `${width()}px` : undefined);
	let heightPx = $.derived(() => $.get(useHeight) && height() && !$.get(fullScreen) ? `${height()}px` : undefined);

	let $$d_2 = $.derived(() => options.value),
		theme = $.derived(() => $.get($$d_2).theme),
		noanimate = $.derived(() => $.get($$d_2).noanimate),
		animRate = $.derived(() => $.get($$d_2).animRate),
		borderless = $.derived(() => $.get($$d_2).borderless),
		heading = $.derived(() => $.get($$d_2).heading),
		onCollapseChange = $.derived(() => $.get($$d_2).onCollapseChange),
		onLog = $.derived(() => $.get($$d_2).onLog);

	const renderIfValue = $.derived(() => typeof options.value.renderIf === 'function'
		? Boolean(options.value.renderIf())
		: Boolean(options.value.renderIf));

	let shouldRender = $.derived(() => $.get(renderIfValue) && (persist() ? BROWSER : true));
	let wrapperClasses = $.derived(() => [$.get(theme), $.get(borderless) && 'borderless']);

	$.user_effect(() => {
		globalValues.keys();

		untrack(() => {
			if (wiggleOnUpdate()) oninspectvaluechange();
		});
	});

	$.user_effect(() => {
		if (!hideGlobalValues() && $.get(shouldRender)) {
			untrack(() => globalInspectState.mounted.add(id));
		}

		return () => {
			globalInspectState.mounted.delete(id);
		};
	});

	setContext(Symbol.for('siv.fixed'), true);
	initialize(options);

	function oninspectvaluechange() {
		if ($.get(flash)) return;

		$.set(flash, true);

		setTimeout(
			() => {
				$.set(flash, false);
			},
			500
		);
	}

	function onAlignChange(x, y) {
		align(`${x} ${y}`);
		settingsChanged(['align']);
	}

	function onHandleClick() {
		open(!open());
		$.set(hovered, false);
		$$props.onOpenChange?.(open());
		settingsChanged(['open']);
	}

	function toggleOpacity() {
		opacity(!opacity());
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
			persistedSettings.current = {
				open: open(),
				appearance: appearance(),
				opacity: opacity(),
				align: align(),
				width: width(),
				height: height()
			};
		}

		onSettingsChange()?.(
			{
				open: open(),
				align: align(),
				opacity: opacity(),
				appearance: appearance(),
				width: width(),
				height: height()
			},
			key
		);
	}

	function log() {
		if ($.get(onLog)) {
			$.get(onLog)($$props.values, 'values', ['Inspect.Panel#values']);
		} else {
			logToConsole(['Inspect.Panel#values'], $$props.values, 'values');
		}
	}

	function logGlobalValues() {
		if ($.get(onLog)) {
			$.get(onLog)(globalValues, 'globalValues', ['globalValues']);
		} else {
			logToConsole(['Inspect.Panel'], Object.fromEntries(globalValues.entries()), 'globalValues');
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_7 = ($$anchor) => {
			var aside = root_1();
			var event_handler = () => $.set(hovered, true);
			var event_handler_1 = () => $.set(hovered, false);

			$.attribute_effect(
				aside,
				() => ({
					oninspectvaluechange,
					onpointerenter: event_handler,
					onpointerleave: event_handler_1,
					class: [
						'inspect-panel',
						$.get(theme),
						$.get(fullScreen) ? 'full' : [$.get(xPosClassname), $.get(yPosClassname)],
						appearance(),
						$.get(borderless) && 'borderless',
						$.get(noanimate) && 'noanimate',
						opacity() && 'opacity',
						$.get(flash) && wiggleOnUpdate() && !hideGlobalValues() && 'flash',
						$.get(shouldBeOpen) && 'open',
						openOnHover() && 'hoverable',
						$.get(resizing) && 'resizing',
						$$props.class
					],
					...$.get(restProps),
					[$.STYLE]: {
						width: $.get(widthPx),
						height: $.get(heightPx),
						'z-index': zIndex(),
						'--transition-rate': $.get(animRate)
					}
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1axlpar'
			);

			var node_1 = $.child(aside);

			{
				var consequent = ($$anchor) => {
					Resize($$anchor, {
						get handles() {
							return $.get(resizableHandles);
						},

						get ele() {
							return $.get(panelEle);
						},

						get enabled() {
							return resize();
						},
						onResize: (key) => settingsChanged([key]),
						get width() {
							return width();
						},

						set width($$value) {
							width($$value);
						},

						get height() {
							return height();
						},

						set height($$value) {
							height($$value);
						},

						get resizing() {
							return $.get(resizing);
						},

						set resizing($$value) {
							$.set(resizing, $$value, true);
						}
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(panelEle)) $$render(consequent);
				});
			}

			var button = $.sibling(node_1, 2);
			var div = $.child(button);
			var svg = $.child(div);
			var path = $.only_child(svg);

			$.reset(div);
			$.reset(button);

			var node_2 = $.sibling(button, 2);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => Boolean(resize() && ($.get(widthPx) || $.get(heightPx))));

						PanelToolbar($$anchor, {
							get xPos() {
								return $.get(xPos);
							},

							get yPos() {
								return $.get(yPos);
							},
							onAlignChange,
							get opacity() {
								return opacity();
							},
							toggleOpacity,
							settingsChanged,
							get showResetButton() {
								return $.get($0);
							},

							onReset: () => {
								width(undefined);
								height(undefined);
								settingsChanged(['width', 'height']);
							},

							get fullScreen() {
								return $.get(fullScreen);
							},

							set fullScreen($$value) {
								$.set(fullScreen, $$value, true);
							},

							get appearance() {
								return appearance();
							},

							set appearance($$value) {
								appearance($$value);
							}
						});
					}
				};

				$.if(node_2, ($$render) => {
					if (!hideToolbar()) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_4 = ($$anchor) => {
					CollapseStateProvider($$anchor, {
						get onCollapseChange() {
							return $.get(onCollapseChange);
						},

						get value() {
							return $$props.value;
						},

						get name() {
							return $$props.name;
						},

						get keys() {
							return $.get(keys);
						},

						get values() {
							return $$props.values;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => hideToolbar() && appearance() === 'dense' ? 'border-top: none' : '');
								let $1 = $.derived(() => $$props.values != null);

								Wrapper($$anchor, {
									get class() {
										return $.get(wrapperClasses);
									},

									get heading() {
										return $.get(heading);
									},

									get style() {
										return $.get($0);
									},

									get showExpandCollapse() {
										return $.get($1);
									},
									onlog: log,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_4 = $.first_child(fragment_5);

										{
											var consequent_2 = ($$anchor) => {
												PropertyList($$anchor, {
													get value() {
														return $$props.values;
													},

													get keys() {
														return $.get(keys);
													}
												});
											};

											var consequent_3 = ($$anchor) => {
												Node($$anchor, {
													get value() {
														return $$props.value;
													},

													get key() {
														return $$props.name;
													}
												});
											};

											var alternate = ($$anchor) => {
												var div_1 = root();

												$.append($$anchor, div_1);
											};

											$.if(node_4, ($$render) => {
												if ($$props.values && $.get(keys).length) $$render(consequent_2); else if ($$props.name || $$props.value) $$render(consequent_3, 1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.value || $$props.name || $.get(keys).length && $$props.values) $$render(consequent_4);
				});
			}

			var node_5 = $.sibling(node_3, 2);

			{
				var consequent_5 = ($$anchor) => {
					{
						let $0 = $.derived(() => Array.from(globalValues.keys()));

						CollapseStateProvider($$anchor, {
							get onCollapseChange() {
								return $.get(onCollapseChange);
							},

							get values() {
								return $.get(globalEntries);
							},

							get keys() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								{
									const heading = ($$anchor) => {
										$.next();

										var text = $.text('global values');

										$.append($$anchor, text);
									};

									const headingExtra = ($$anchor) => {
										NodeActionButton($$anchor, {
											onclick: () => globalValues.clear(),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('clear');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									};

									Wrapper($$anchor, {
										get class() {
											return $.get(wrapperClasses);
										},
										showExpandCollapse: true,
										onlog: logGlobalValues,
										heading,
										headingExtra,
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = $.comment();
											var node_6 = $.first_child(fragment_11);

											$.each(node_6, 17, () => globalValues, ([key, entry]) => key, ($$anchor, $$item) => {
												var $$array_2 = $.derived(() => $.to_array($.get($$item), 2));
												let key = () => $.get($$array_2)[0];
												let entry = () => $.get($$array_2)[1];

												Node($$anchor, {
													get note() {
														return entry().note;
													},

													get key() {
														return key();
													},

													get value() {
														return entry().value;
													}
												});
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { heading: true, headingExtra: true, default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_5, ($$render) => {
					if (globalValues.size > 0 && !hideGlobalValues()) $$render(consequent_5);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_13 = $.comment();
					var node_8 = $.first_child(fragment_13);

					$.snippet(node_8, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_13);
				};

				$.if(node_7, ($$render) => {
					if ($$props.children) $$render(consequent_6);
				});
			}

			$.reset(aside);
			$.bind_this(aside, ($$value) => $.set(panelEle, $$value), () => $.get(panelEle));

			$.template_effect(() => {
				$.set_attribute(button, 'aria-label', $.get(handleLabel));
				$.set_attribute(button, 'title', $.get(handleLabel));
				$.set_attribute(path, 'stroke-width', openOnHover() ? open() ? 0 : 80 : 0);

				$.set_attribute(path, 'fill', openOnHover()
					? open() ? 'currentColor' : 'transparent'
					: 'currentColor');
			});

			$.delegated('click', button, onHandleClick);
			$.transition(3, aside, () => fade, () => ({ duration: options.transitionDuration }));
			$.append($$anchor, aside);
		};

		$.if(node, ($$render) => {
			if ($.get(shouldRender)) $$render(consequent_7);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);