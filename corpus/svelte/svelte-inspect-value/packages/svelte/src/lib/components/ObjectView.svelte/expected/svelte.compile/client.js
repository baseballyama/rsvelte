import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enumerateObject } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
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

export default function ObjectView($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let namedConstructor = $.derived(() => $$props.value?.constructor?.name !== 'Object' ? $$props.value?.constructor?.name : false);
	let objectType = $.derived(() => $.get(namedConstructor) ? $.get(namedConstructor) : $$props.type);
	let properties = $.derived(() => enumerateObject($$props.value));

	let keys = $.derived(() => [
		...$.get(properties),
		$.get(namedConstructor) ? 'constructor' : undefined
	].filter((v) => v != null));

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			Preview($$anchor, {
				prefix: '{',
				postfix: '}',
				get value() {
					return $$props.value;
				},

				get path() {
					return $$props.path;
				},

				get keys() {
					return $.get(keys);
				},

				get showPreview() {
					return showPreview();
				}
			});
		};

		let $0 = $.derived(() => !!$.get(namedConstructor));

		Expandable($$anchor, $.spread_props(
			{
				get type() {
					return $.get(objectType);
				},

				get length() {
					return $.get(keys).length;
				},

				get key() {
					return key();
				},

				get path() {
					return $$props.path;
				},

				get value() {
					return $$props.value;
				},

				get forceType() {
					return $.get($0);
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
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

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
											return $$props.path;
										}
									});
								};

								var alternate = ($$anchor) => {
									{
										let $0 = $.derived(() => $$props.value?.[key()]);

										Node($$anchor, {
											get value() {
												return $.get($0);
											},

											get key() {
												return key();
											},

											get path() {
												return $$props.path;
											}
										});
									}
								};

								$.if(node, ($$render) => {
									if (descriptor()?.get || descriptor()?.set) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_3);
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

	$.pop();
}