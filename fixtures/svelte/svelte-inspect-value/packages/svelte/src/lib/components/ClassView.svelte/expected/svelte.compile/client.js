import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPreviewLevel } from '../contexts.js';
import { getAllProperties } from '../util.js';
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

var root = $.from_html(`<span> </span> <!>`, 1);

export default function ClassView($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	let rest = $.rest_props($$props, rest_excludes);

	const previewLevel = getPreviewLevel();
	const nonStatic = ['name', 'length', 'prototype'];
	let keys = $.derived(() => getAllProperties($$props.value));

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var text = $.only_child(span, true);
			var node = $.sibling(span, 2);

			{
				var consequent = ($$anchor) => {
					Preview($$anchor, {
						prefix: '{',
						postfix: '}',
						get keys() {
							return $.get(keys);
						},

						get value() {
							return $$props.value;
						},

						get showPreview() {
							return showPreview();
						}
					});
				};

				$.if(node, ($$render) => {
					if (!previewLevel) $$render(consequent);
				});
			}

			$.template_effect(() => {
				$.set_class(span, 1, `value ${$$props.type ?? ''}`);
				$.set_text(text, $$props.value.name);
			});

			$.append($$anchor, fragment_1);
		};

		Expandable($$anchor, $.spread_props(
			() => ({
				value: $$props.value,
				key: $$props.key,
				type: $$props.type,
				path: $$props.path
			}),
			{
				get length() {
					return $.get(keys).length;
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
							var fragment_4 = $.comment();
							var node_1 = $.first_child(fragment_4);

							{
								var consequent_1 = ($$anchor) => {
									{
										let $0 = $.derived(() => nonStatic.includes(key()) ? '' : 'static');

										GetterSetter($$anchor, {
											get keyPrefix() {
												return $.get($0);
											},

											get key() {
												return key();
											},

											get value() {
												return $$props.value;
											},

											get descriptor() {
												return descriptor();
											},

											get path() {
												return $$props.path;
											}
										});
									}
								};

								var alternate = ($$anchor) => {
									{
										let $0 = $.derived(() => nonStatic.includes(key()) ? '' : 'static');

										Node($$anchor, {
											get keyPrefix() {
												return $.get($0);
											},

											get key() {
												return key();
											},

											get value() {
												return $$props.value[key()];
											},

											get path() {
												return $$props.path;
											}
										});
									}
								};

								$.if(node_1, ($$render) => {
									if (descriptor()?.get || descriptor()?.set) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_4);
						};

						PropertyList($$anchor, {
							get keys() {
								return $.get(keys);
							},

							get value() {
								return $$props.value;
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