import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';
import { slide } from '../transition/index.js';
import { getPreviewLevel, useSearchContext, useValueCache } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { InspectError } from '../types.js';
import { descriptorPrefix, nodeActionKeydown, stringifyPath } from '../util.js';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Input from './Input.svelte';
import InspectErrorView from './InspectErrorView.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import Preview from './Preview.svelte';
import CloseIcon from './icons/CloseIcon.svelte';
import NodeIconButton from './NodeIconButton.svelte';

export default function GetterSetter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			display,
			key,
			path: prevPath = [],
			descriptor,
			children,
			keyPrefix: _keyPrefix,
			usedefaults,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();
		const previewLevel = getPreviewLevel();
		const valueCache = useValueCache();
		const searchResult = useSearchContext();
		let valueRetrieved = false;
		let getterValue = void 0;
		let error = void 0;
		let isSetting = false;
		let inputText = '';
		let inputState = 'untouched';
		let inputValue = void 0;
		let path = $.derived(() => key != null && prevPath ? [...prevPath, key] : ['root']);
		let keyPrefix = $.derived(() => `${_keyPrefix ?? ''} ${descriptorPrefix(descriptor)}`);
		let inputElement = void 0;
		let setButton = void 0;
		let stringifiedPath = $.derived(() => stringifyPath(path()));
		let hasCachedValue = $.derived(() => valueCache.has(stringifiedPath()));

		let retrievedValue = $.derived(() => valueRetrieved
			? getterValue
			: hasCachedValue() ? valueCache.get(stringifiedPath()) : undefined);

		let match = $.derived(() => searchResult?.().matchingPaths.includes(stringifiedPath()));

		function callGetter(e) {
			e.stopPropagation();

			try {
				valueRetrieved = true;

				const newGetterValue = descriptor.get?.call(value);

				getterValue = newGetterValue;
				valueCache.set(stringifiedPath(), getterValue);
			} catch(e) {
				valueCache.delete(stringifiedPath());
				error = new InspectError('getter call failed', descriptor.get, { cause: e });
				valueRetrieved = false;
			}
		}

		function callSetter(e) {
			e.stopPropagation();

			if (inputState === 'valid') {
				try {
					descriptor.set?.call(value, inputValue);

					// stateContext.setGetterValue(path, inputValue)
				} catch(e) {
					error = new InspectError('setter call failed', descriptor.set, { cause: e });

					// stateContext.setGetterValue(path, undefined)
				} finally {
					isSetting = false;
					inputText = '';
					inputValue = undefined;
					inputState = 'untouched';
				}
			} else {
				inputState = 'invalid';
			}
		}

		function reset() {
			error = undefined;
			getterValue = undefined;
			valueRetrieved = false;
			valueCache.delete(stringifiedPath());
		}

		async function onkeyup(event) {
			const value = event.currentTarget.value;

			if (value.length) {
				try {
					inputValue = JSON.parse(value);
					inputState = 'valid';
				} catch {
					inputState = 'invalid';
				}
			} else {
				inputState = 'untouched';
			}
		}

		async function onkeydown(event) {
			event.stopPropagation();

			if (event.key === 'Escape') {
				isSetting = false;
				inputText = '';
				inputState = 'untouched';
				await tick();
				setButton?.focus();

				return;
			}

			if (event.key === 'Enter') {
				callSetter(event);
			}
		}

		async function showInput(e) {
			e.stopPropagation();
			isSetting = true;
			await tick();
			inputElement?.focus();
		}

		async function hideInput(e) {
			e.stopPropagation();
			isSetting = false;
			await tick();
			setButton?.focus();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (error) {
				$$renderer.push('<!--[0-->');

				InspectErrorView($$renderer, {
					keyPrefix: keyPrefix(),
					reset,
					key,
					path: path(),
					value: error
				});
			} else {
				$$renderer.push('<!--[-1-->');

				{
					function valuePreview($$renderer, { showPreview }) {
						if (isSetting) {
							$$renderer.push('<!--[0-->');

							Input($$renderer, {
								type: 'text',
								class: inputState,
								transition: slide,
								transitionParams: { axis: 'x', duration: options.transitionDuration },
								placeholder: 'json',
								style: 'max-width: 20ch',
								containerAttrs: { style: 'max-width: 20ch;' },
								onclick: (e) => {
									e.stopPropagation();
								},
								onkeydown,
								onkeyup,
								get value() {
									return inputText;
								},

								set value($$value) {
									inputText = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							NodeActionButton($$renderer, {
								title: `set ${$.stringify(key?.toString())}`,
								onclick: callSetter,
								onkeydown: nodeActionKeydown(callSetter),
								style: 'padding-right: 0.5em',
								children: ($$renderer) => {
									$$renderer.push(`<!---->set`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NodeIconButton($$renderer, {
								title: 'cancel',
								onclick: hideInput,
								onkeydown: nodeActionKeydown(hideInput),
								children: ($$renderer) => {
									CloseIcon($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (descriptor.set && previewLevel === 0) {
								$$renderer.push('<!--[0-->');

								NodeActionButton($$renderer, {
									title: `set ${$.stringify(key?.toString())}`,
									onclick: showInput,
									onkeydown: nodeActionKeydown(showInput),
									children: ($$renderer) => {
										$$renderer.push(`<!---->set`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (descriptor.get) {
								$$renderer.push('<!--[0-->');

								if (previewLevel === 0) {
									$$renderer.push('<!--[0-->');

									NodeActionButton($$renderer, {
										title: `get ${$.stringify(key?.toString())}`,
										onclick: callGetter,
										onkeydown: nodeActionKeydown(callGetter),
										children: ($$renderer) => {
											$$renderer.push(`<!---->get`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								Preview($$renderer, {
									usedefaults,
									showPreview: (hasCachedValue() || valueRetrieved) && showPreview,
									singleValue: { value: retrievedValue() },
									style: previewLevel > 0 ? 'margin-left: -0.5em' : '',
									bracketStyle: 'color: var(--_comment-color)',
									showKey: false,
									startLevel: 0,
									prefix: '(',
									postfix: ')',
									keyDelim: '',
									path: path()
								});

								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					Expandable($$renderer, $.spread_props([
						{
							key,
							keyPrefix: keyPrefix(),
							path: path(),
							keyDelim: previewLevel > 0 ? '' : ':',
							value: descriptor,
							showLength: false,
							keepPreviewOnExpand: true,
							length: 1,
							match: match()
						},
						rest,
						{
							valuePreview,
							children: ($$renderer) => {
								if (descriptor.get) {
									$$renderer.push('<!--[0-->');

									Entry($$renderer, {
										i: 0,
										children: ($$renderer) => {
											Node($$renderer, {
												key: 'value',
												value: retrievedValue(),
												path: path(),
												usedefaults
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Entry($$renderer, {
										i: 1,
										children: ($$renderer) => {
											Node($$renderer, {
												key: 'getter',
												value: descriptor.get,
												path: path(),
												usedefaults
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (descriptor.set) {
									$$renderer.push('<!--[0-->');

									Entry($$renderer, {
										i: 2,
										children: ($$renderer) => {
											Node($$renderer, {
												key: 'setter',
												value: descriptor.set,
												path: path(),
												usedefaults
											});
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { valuePreview: true, default: true }
						}
					]));
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}