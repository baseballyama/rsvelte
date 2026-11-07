import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import OneLineView from './OneLineView.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'key', 'path']);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let keys = $.derived(() => getAllProperties($$props.value));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
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

				Expandable($$anchor, $.spread_props(
					{
						get length() {
							return $.get(keys).length;
						},

						get key() {
							return $$props.key;
						},

						get path() {
							return $$props.path;
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
									var fragment_4 = $.comment();
									var node_1 = $.first_child(fragment_4);

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
											Node($$anchor, {
												get value() {
													return $$props.value[key()];
												},

												get key() {
													return key();
												},

												get path() {
													return $$props.path;
												}
											});
										};

										$.if(node_1, ($$render) => {
											if (descriptor()?.get || descriptor()?.set) $$render(consequent); else $$render(alternate, -1);
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
		};

		var alternate_1 = ($$anchor) => {
			OneLineView($$anchor, $.spread_props(
				{
					get key() {
						return $$props.key;
					},

					get path() {
						return $$props.path;
					},

					get value() {
						return $$props.value;
					}
				},
				() => rest
			));
		};

		$.if(node, ($$render) => {
			if ($.get(keys).length) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}