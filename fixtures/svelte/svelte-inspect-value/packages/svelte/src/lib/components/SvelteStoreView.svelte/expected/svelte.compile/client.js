import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import { getAllProperties, isValidStore } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import ObjectView from './ObjectView.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path'
]);

export default function SvelteStoreView($$anchor, $$props) {
	$.push($$props, true);

	const $value = () => $.store_get($$props.value, '$value', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let key = $.prop($$props, 'key', 3, undefined),
		path = $.prop($$props, 'path', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();

	let $$d = $.derived(() => options.value),
		storeMode = $.derived(() => $.get($$d).stores);

	const valueKey = Symbol('store-value');
	let namedConstructor = $.derived(() => $$props.value.constructor.name !== 'Object' ? $$props.value.constructor.name : false);
	let storeType = $.derived(() => typeof $$props.value.set === 'function' ? 'writable' : 'readable');
	let valueType = $.derived(() => $.get(namedConstructor) ? $.get(namedConstructor) : $.get(storeType));
	let keys = $.derived(() => [valueKey, ...getAllProperties($$props.value)]);
	let validStore = $.derived(() => isValidStore($$props.value));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					{
						const valuePreview = ($$anchor, $$arg0) => {
							let showPreview = () => ($$arg0?.()).showPreview;

							{
								let $0 = $.derived(() => ({ value: $value() }));

								Preview($$anchor, {
									style: 'margin-left: -0.5em',
									showKey: false,
									get singleValue() {
										return $.get($0);
									},
									prefix: '(',
									postfix: ')',
									startLevel: 0,
									bracketStyle: 'color: var(--_comment-color)',
									get showPreview() {
										return showPreview();
									}
								});
							}
						};

						Expandable($$anchor, $.spread_props(
							{
								get type() {
									return $.get(valueType);
								},

								get length() {
									return $.get(keys).length;
								},

								get key() {
									return key();
								},

								get path() {
									return path();
								},

								get value() {
									return $$props.value;
								}
							},
							() => rest,
							{
								valuePreview,
								children: ($$anchor, $$slotProps) => {
									{
										const item = ($$anchor, $$arg0) => {
											let key = () => ($$arg0?.()).key;
											let descriptor = () => ($$arg0?.()).descriptor;
											var fragment_5 = $.comment();
											var node_2 = $.first_child(fragment_5);

											{
												var consequent = ($$anchor) => {
													GetterSetter($$anchor, {
														get value() {
															return $$props.value;
														},

														get descriptor() {
															return descriptor();
														},

														get key() {
															return key();
														},

														get path() {
															return path();
														}
													});
												};

												var consequent_1 = ($$anchor) => {
													{
														let $0 = $.derived(() => [...path(), Symbol('$')]);

														Node($$anchor, {
															key: 'value',
															keyPrefix: '$',
															keyStyle: '--_text-color: var(--_comment-color); gap: 0;',
															get value() {
																return $value();
															},

															get path() {
																return $.get($0);
															}
														});
													}
												};

												var alternate = ($$anchor) => {
													Node($$anchor, {
														get value() {
															return $$props.value[key()];
														},

														get key() {
															return key();
														},

														get path() {
															return path();
														}
													});
												};

												$.if(node_2, ($$render) => {
													if (descriptor()?.get || descriptor()?.set) $$render(consequent); else if (key() === valueKey) $$render(consequent_1, 1); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_5);
										};

										PropertyList($$anchor, {
											get keys() {
												return $.get(keys);
											},

											get value() {
												return $$props.value;
											},

											get type() {
												return $$props.type;
											},
											item,
											$$slots: { item: true }
										});
									}
								},
								$$slots: { valuePreview: true, default: true }
							}
						));
					}
				};

				var consequent_3 = ($$anchor) => {
					{
						let $0 = $.derived(() => path()?.toSpliced(path().length - 1));

						Node($$anchor, $.spread_props(
							{
								get key() {
									return key();
								},

								get path() {
									return $.get($0);
								},

								get value() {
									return $value();
								}
							},
							() => rest,
							{
								note: {
									title: 'store',
									description: 'Value was retrieved by subscribing to a store'
								}
							}
						));
					}
				};

				$.if(node_1, ($$render) => {
					if ($.get(storeMode) === 'full' || $.get(storeMode) === true) $$render(consequent_2); else if ($.get(storeMode) === 'value-only') $$render(consequent_3, 1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			ObjectView($$anchor, $.spread_props(
				{
					note: {
						title: 'invalid store',
						description: 'Subscribe function did not return a valid subscriber.\nReverted to default object view.'
					},

					get value() {
						return $$props.value;
					},

					get key() {
						return key();
					},
					type: 'object',
					get path() {
						return path();
					}
				},
				() => rest
			));
		};

		$.if(node, ($$render) => {
			if ($.get(validStore)) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}