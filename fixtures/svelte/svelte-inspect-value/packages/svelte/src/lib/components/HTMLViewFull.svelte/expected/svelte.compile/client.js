import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import HtmlValue from './HTMLValue.svelte';
import Node from './Node.svelte';
import PropertyList from './PropertyList.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'path',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function HTMLViewFull($$anchor, $$props) {
	$.push($$props, true);

	// import { htmlState } from '../util/mutation-observer.svelte.js'
	let key = $.prop($$props, 'key', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let keys = $.derived(() => getAllProperties($$props.value).filter((prop) => ![
		'__svelte_meta',
		'__className',
		'__attributes',
		'__styles',
		'__t'
	].includes(prop.toString())));

	{
		const valuePreview = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.key(node, () => $$props.value, ($$anchor) => {
				HtmlValue($$anchor, {
					get value() {
						return $$props.value;
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		Expandable($$anchor, $.spread_props(
			() => ({ value: $$props.value, key: key(), path: $$props.path }),
			{
				get length() {
					return $.get(keys).length;
				},
				keepPreviewOnExpand: false
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_1 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_2 = $.first_child(fragment_4);

							$.snippet(node_2, () => $$props.children);
							$.append($$anchor, fragment_4);
						};

						$.if(node_1, ($$render) => {
							if ($$props.children) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_1, 2);

					{
						const item = ($$anchor, $$arg0) => {
							let key = () => ($$arg0?.()).key;
							let descriptor = () => ($$arg0?.()).descriptor;
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							{
								var consequent_1 = ($$anchor) => {
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

								$.if(node_4, ($$render) => {
									if (descriptor()?.get || descriptor()?.set) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_5);
						};

						PropertyList(node_3, {
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

					$.append($$anchor, fragment_3);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}