import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'display',
	'key',
	'path',
	'descriptor',
	'children',
	'keyPrefix',
	'usedefaults'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function GetterSetter($$anchor, $$props) {
	$.push($$props, true);

	let prevPath = $.prop($$props, 'path', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();
	const previewLevel = getPreviewLevel();
	const valueCache = useValueCache();
	const searchResult = useSearchContext();
	let valueRetrieved = $.state(false);
	let getterValue = $.state(void 0);
	let error = $.state(void 0);
	let isSetting = $.state(false);
	let inputText = $.state('');
	let inputState = $.state('untouched');
	let inputValue = $.state(void 0);
	let path = $.derived(() => $$props.key != null && prevPath() ? [...prevPath(), $$props.key] : ['root']);
	let keyPrefix = $.derived(() => `${$$props.keyPrefix ?? ''} ${descriptorPrefix($$props.descriptor)}`);
	let inputElement = $.state(void 0);
	let setButton = $.state(void 0);
	let stringifiedPath = $.derived(() => stringifyPath($.get(path)));
	let hasCachedValue = $.derived(() => valueCache.has($.get(stringifiedPath)));

	let retrievedValue = $.derived(() => $.get(valueRetrieved)
		? $.get(getterValue)
		: $.get(hasCachedValue) ? valueCache.get($.get(stringifiedPath)) : undefined);

	let match = $.derived(() => searchResult?.().matchingPaths.includes($.get(stringifiedPath)));

	function callGetter(e) {
		e.stopPropagation();

		try {
			$.set(valueRetrieved, true);

			const newGetterValue = $$props.descriptor.get?.call($$props.value);

			$.set(getterValue, newGetterValue, true);
			valueCache.set($.get(stringifiedPath), $.get(getterValue));
		} catch(e) {
			valueCache.delete($.get(stringifiedPath));
			$.set(error, new InspectError('getter call failed', $$props.descriptor.get, { cause: e }), true);
			$.set(valueRetrieved, false);
		}
	}

	function callSetter(e) {
		e.stopPropagation();

		if ($.get(inputState) === 'valid') {
			try {
				$$props.descriptor.set?.call($$props.value, $.get(inputValue));

				// stateContext.setGetterValue(path, inputValue)
			} catch(e) {
				$.set(error, new InspectError('setter call failed', $$props.descriptor.set, { cause: e }), true);

				// stateContext.setGetterValue(path, undefined)
			} finally {
				$.set(isSetting, false);
				$.set(inputText, '');
				$.set(inputValue, undefined);
				$.set(inputState, 'untouched');
			}
		} else {
			$.set(inputState, 'invalid');
		}
	}

	function reset() {
		$.set(error, undefined);
		$.set(getterValue, undefined);
		$.set(valueRetrieved, false);
		valueCache.delete($.get(stringifiedPath));
	}

	async function onkeyup(event) {
		const value = event.currentTarget.value;

		if (value.length) {
			try {
				$.set(inputValue, JSON.parse(value), true);
				$.set(inputState, 'valid');
			} catch {
				$.set(inputState, 'invalid');
			}
		} else {
			$.set(inputState, 'untouched');
		}
	}

	async function onkeydown(event) {
		event.stopPropagation();

		if (event.key === 'Escape') {
			$.set(isSetting, false);
			$.set(inputText, '');
			$.set(inputState, 'untouched');
			await tick();
			$.get(setButton)?.focus();

			return;
		}

		if (event.key === 'Enter') {
			callSetter(event);
		}
	}

	async function showInput(e) {
		e.stopPropagation();
		$.set(isSetting, true);
		await tick();
		$.get(inputElement)?.focus();
	}

	async function hideInput(e) {
		e.stopPropagation();
		$.set(isSetting, false);
		await tick();
		$.get(setButton)?.focus();
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			InspectErrorView($$anchor, {
				get keyPrefix() {
					return $.get(keyPrefix);
				},
				reset,
				get key() {
					return $$props.key;
				},

				get path() {
					return $.get(path);
				},

				get value() {
					return $.get(error);
				}
			});
		};

		var alternate_1 = ($$anchor) => {
			{
				const valuePreview = ($$anchor, $$arg0) => {
					let showPreview = () => ($$arg0?.()).showPreview;
					var fragment_3 = $.comment();
					var node_1 = $.first_child(fragment_3);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_4 = root();
							var node_2 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => ({ axis: 'x', duration: options.transitionDuration }));

								$.bind_this(
									Input(node_2, {
										type: 'text',
										get class() {
											return $.get(inputState);
										},

										get transition() {
											return slide;
										},

										get transitionParams() {
											return $.get($0);
										},
										placeholder: 'json',
										style: 'max-width: 20ch',
										containerAttrs: { style: 'max-width: 20ch;' },
										onclick: (e) => {
											e.stopPropagation();
										},
										onkeydown,
										onkeyup,
										get value() {
											return $.get(inputText);
										},

										set value($$value) {
											$.set(inputText, $$value, true);
										}
									}),
									($$value) => $.set(inputElement, $$value, true),
									() => $.get(inputElement)
								);
							}

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => $$props.key?.toString());
								let $1 = $.derived(() => nodeActionKeydown(callSetter));

								NodeActionButton(node_3, {
									get title() {
										return `set ${$.get($0) ?? ''}`;
									},
									onclick: callSetter,
									get onkeydown() {
										return $.get($1);
									},
									style: 'padding-right: 0.5em',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('set');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							}

							var node_4 = $.sibling(node_3, 2);

							{
								let $0 = $.derived(() => nodeActionKeydown(hideInput));

								NodeIconButton(node_4, {
									title: 'cancel',
									onclick: hideInput,
									get onkeydown() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										CloseIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_4);
						};

						var alternate = ($$anchor) => {
							var fragment_6 = root_1();
							var node_5 = $.first_child(fragment_6);

							{
								var consequent_2 = ($$anchor) => {
									{
										let $0 = $.derived(() => $$props.key?.toString());
										let $1 = $.derived(() => nodeActionKeydown(showInput));

										$.bind_this(
											NodeActionButton($$anchor, {
												get title() {
													return `set ${$.get($0) ?? ''}`;
												},
												onclick: showInput,
												get onkeydown() {
													return $.get($1);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('set');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											}),
											($$value) => $.set(setButton, $$value, true),
											() => $.get(setButton)
										);
									}
								};

								$.if(node_5, ($$render) => {
									if ($$props.descriptor.set && previewLevel === 0) $$render(consequent_2);
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_8 = root_1();
									var node_7 = $.first_child(fragment_8);

									{
										var consequent_3 = ($$anchor) => {
											{
												let $0 = $.derived(() => $$props.key?.toString());
												let $1 = $.derived(() => nodeActionKeydown(callGetter));

												NodeActionButton($$anchor, {
													get title() {
														return `get ${$.get($0) ?? ''}`;
													},
													onclick: callGetter,
													get onkeydown() {
														return $.get($1);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('get');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											}
										};

										$.if(node_7, ($$render) => {
											if (previewLevel === 0) $$render(consequent_3);
										});
									}

									var node_8 = $.sibling(node_7, 2);

									{
										let $0 = $.derived(() => ($.get(hasCachedValue) || $.get(valueRetrieved)) && showPreview());
										let $1 = $.derived(() => ({ value: $.get(retrievedValue) }));
										let $2 = $.derived(() => previewLevel > 0 ? 'margin-left: -0.5em' : '');

										Preview(node_8, {
											get usedefaults() {
												return $$props.usedefaults;
											},

											get showPreview() {
												return $.get($0);
											},

											get singleValue() {
												return $.get($1);
											},

											get style() {
												return $.get($2);
											},
											bracketStyle: 'color: var(--_comment-color)',
											showKey: false,
											startLevel: 0,
											prefix: '(',
											postfix: ')',
											keyDelim: '',
											get path() {
												return $.get(path);
											}
										});
									}

									$.append($$anchor, fragment_8);
								};

								$.if(node_6, ($$render) => {
									if ($$props.descriptor.get) $$render(consequent_4);
								});
							}

							$.append($$anchor, fragment_6);
						};

						$.if(node_1, ($$render) => {
							if ($.get(isSetting)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_3);
				};

				let $0 = $.derived(() => previewLevel > 0 ? '' : ':');

				Expandable($$anchor, $.spread_props(
					{
						get key() {
							return $$props.key;
						},

						get keyPrefix() {
							return $.get(keyPrefix);
						},

						get path() {
							return $.get(path);
						},

						get keyDelim() {
							return $.get($0);
						},

						get value() {
							return $$props.descriptor;
						},
						showLength: false,
						keepPreviewOnExpand: true,
						length: 1,
						get match() {
							return $.get(match);
						}
					},
					() => rest,
					{
						valuePreview,
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_1();
							var node_9 = $.first_child(fragment_10);

							{
								var consequent_5 = ($$anchor) => {
									var fragment_11 = root_1();
									var node_10 = $.first_child(fragment_11);

									Entry(node_10, {
										i: 0,
										children: ($$anchor, $$slotProps) => {
											Node($$anchor, {
												key: 'value',
												get value() {
													return $.get(retrievedValue);
												},

												get path() {
													return $.get(path);
												},

												get usedefaults() {
													return $$props.usedefaults;
												}
											});
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									Entry(node_11, {
										i: 1,
										children: ($$anchor, $$slotProps) => {
											Node($$anchor, {
												key: 'getter',
												get value() {
													return $$props.descriptor.get;
												},

												get path() {
													return $.get(path);
												},

												get usedefaults() {
													return $$props.usedefaults;
												}
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_11);
								};

								$.if(node_9, ($$render) => {
									if ($$props.descriptor.get) $$render(consequent_5);
								});
							}

							var node_12 = $.sibling(node_9, 2);

							{
								var consequent_6 = ($$anchor) => {
									Entry($$anchor, {
										i: 2,
										children: ($$anchor, $$slotProps) => {
											Node($$anchor, {
												key: 'setter',
												get value() {
													return $$props.descriptor.set;
												},

												get path() {
													return $.get(path);
												},

												get usedefaults() {
													return $$props.usedefaults;
												}
											});
										},
										$$slots: { default: true }
									});
								};

								$.if(node_12, ($$render) => {
									if ($$props.descriptor.set) $$render(consequent_6);
								});
							}

							$.append($$anchor, fragment_10);
						},
						$$slots: { valuePreview: true, default: true }
					}
				));
			}
		};

		$.if(node, ($$render) => {
			if ($.get(error)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}