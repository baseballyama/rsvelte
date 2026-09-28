import * as $ from 'svelte/internal/server';
import { getContext, setContext } from 'svelte';
import { useOptions } from '../options.svelte.js';
import { getPropertyDescriptor, getType } from '../util.js';
import GetterSetter from './GetterSetter.svelte';
import Key from './Key.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import Type from './Type.svelte';
import { fly, slide } from '../transition/index.js';

function comma($$renderer) {
	$$renderer.push(`<span class="comma svelte-ol42oa">,</span>`);
}

export default function Preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			list: previewList,
			keyValue: previewKeyValue,
			keys: previewKeys,
			singleValue,
			path,
			prefix,
			postfix,
			showKey = true,
			keyDelim = ':',
			keyStyle = '',
			startLevel = 1,
			showPreview = false,
			class: classValue,
			bracketStyle = '',
			usedefaults,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// svelte-ignore state_referenced_locally TODO
		const previewLevel = getContext(Symbol.for('siv.preview-level')) ?? startLevel;

		const options = useOptions();

		let $$d = $.derived(() => options.value),
			previewEntries = $.derived(() => $$d().previewEntries),
			previewDepth = $.derived(() => $$d().previewDepth),
			optsShowPreview = $.derived(() => $$d().showPreview),
			easing = $.derived(() => $$d().easing);

		setContext(Symbol.for('siv.preview-level'), (previewLevel ?? 0) + 1);

		let list = $.derived(() => previewList?.slice(0, previewEntries()));
		let keyValue = $.derived(() => previewKeyValue?.slice(0, previewEntries()));
		let keys = $.derived(() => previewKeys?.slice(0, previewEntries()));

		let hasMore = $.derived(() => {
			if (list() && previewList) {
				return list().length < previewList.length;
			} else if (keyValue() && previewKeyValue) {
				return keyValue().length < previewKeyValue.length;
			} else if (keys() && previewKeys) {
				return keys().length < previewKeys.length;
			}

			return false;
		});

		function alwaysRender(type) {
			return [
				'boolean',
				'string',
				'number',
				'bigint',
				'symbol',
				'regexp',
				'class',
				'undefined',
				'null',
				'store'
			].includes(type);
		}

		function valuePreview($$renderer, value, key) {
			const valType = getType(value, options.value.stores);
			const newPath = path && key ? [...path, key] : undefined;

			if (alwaysRender(valType) || previewLevel < previewDepth()) {
				$$renderer.push('<!--[0-->');
				Node($$renderer, { path, key, value, showKey, keyDelim, keyStyle, usedefaults });
			} else {
				$$renderer.push(`<!--[-1--><div class="key-type-preview svelte-ol42oa">`);

				if (showKey) {
					$$renderer.push('<!--[0-->');

					Key($$renderer, {
						disabled: true,
						path: newPath,
						key,
						delim: keyDelim,
						style: keyStyle,
						allowUndefined: true
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				Type($$renderer, { type: valType, force: true });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		function previewValue($$renderer, key, _force = false, descriptor) {
			if (descriptor?.set || descriptor?.get) {
				$$renderer.push('<!--[0-->');
				GetterSetter($$renderer, { key, descriptor, value, path });
			} else {
				$$renderer.push('<!--[-1-->');
				valuePreview($$renderer, value?.[key], key);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (optsShowPreview() && previewEntries() > 0 && showPreview) {
			$$renderer.push('<!--[0-->');

			{
				function failed($$renderer, _, reset) {
					$$renderer.push(`<!---->preview error. check console `);

					NodeActionButton($$renderer, {
						onclick: reset,
						children: ($$renderer) => {
							$$renderer.push(`<!---->reset`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.boundary({ failed }, ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					{
						$$renderer.push(`<div${$.attributes(
							{
								'data-testid': 'preview',
								class: $.clsx(['preview', classValue]),
								...rest
							},
							'svelte-ol42oa'
						)}>`);

						if (prefix) {
							$$renderer.push(`<!--[0--><span${$.attr_class(`pre level-${$.stringify(previewLevel)}`, 'svelte-ol42oa')}${$.attr_style(bracketStyle)}>${$.escape(prefix)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="inner svelte-ol42oa">`);

						if (keys() && value) {
							$$renderer.push(`<!--[0--><!--[-->`);

							const each_array = $.ensure_array_like(keys());

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let key = each_array[i];
								const descriptor = getPropertyDescriptor(value, key);

								previewValue($$renderer, key, false, descriptor);
								$$renderer.push(`<!---->`);

								if (i < keys().length - 1) {
									$$renderer.push('<!--[0-->');
									comma($$renderer);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						} else if (keyValue()) {
							$$renderer.push(`<!--[1--><!--[-->`);

							const each_array_1 = $.ensure_array_like(keyValue());

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let [key, value] = each_array_1[i];

								valuePreview($$renderer, value, key);
								$$renderer.push(`<!---->`);

								if (i < keyValue().length - 1) {
									$$renderer.push('<!--[0-->');
									comma($$renderer);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						} else if (list()) {
							$$renderer.push(`<!--[2--><!--[-->`);

							const each_array_2 = $.ensure_array_like(list());

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let value = each_array_2[i];

								valuePreview($$renderer, value, i);
								$$renderer.push(`<!---->`);

								if (i < list().length - 1) {
									$$renderer.push('<!--[0-->');
									comma($$renderer);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						} else if (singleValue) {
							$$renderer.push('<!--[3-->');
							valuePreview($$renderer, singleValue.value, undefined);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (hasMore()) {
							$$renderer.push('<!--[0-->');
							comma($$renderer);
							$$renderer.push(`<!----><span class="ellipsis svelte-ol42oa">…</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (postfix) {
							$$renderer.push(`<!--[0--><span${$.attr_class(`post level-${$.stringify(previewLevel)}`, 'svelte-ol42oa')}${$.attr_style(bracketStyle)}>${$.escape(postfix)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]-->`);
				});
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}