import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function TypedArrayView($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const internalKeys = ['buffer', 'byteLength', 'byteOffset', 'length'];

	function getValue(key) {
		return $$props.value[key];
	}

	let entries = $.derived(() => internalKeys.map((k) => [k, getValue(k)]));
	let preview = $.derived(() => $$props.value.slice(0, 3));

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			Preview($$anchor, {
				prefix: '[',
				postfix: ']',
				get list() {
					return $.get(preview);
				},
				showKey: false,
				get showPreview() {
					return showPreview();
				}
			});
		};

		Expandable($$anchor, $.spread_props(
			() => ({
				value: $$props.value,
				key: key(),
				type: $$props.type,
				path: $$props.path
			}),
			{
				get length() {
					return $$props.value.length;
				}
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => $$props.value, $.index, ($$anchor, num, i) => {
						Entry($$anchor, {
							i,
							children: ($$anchor, $$slotProps) => {
								Node($$anchor, {
									key: i,
									get value() {
										return $.get(num);
									},

									get path() {
										return $$props.path;
									}
								});
							},
							$$slots: { default: true }
						});
					});

					var node_1 = $.sibling(node, 2);

					$.each(node_1, 19, () => $.get(entries), ([key, val]) => key, ($$anchor, $$item, i, $$array) => {
						var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
						let key = () => $.get($$array_1)[0];
						let val = () => $.get($$array_1)[1];

						{
							let $0 = $.derived(() => $$props.value.length + $.get(i));

							Entry($$anchor, {
								get i() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									Node($$anchor, {
										get key() {
											return key();
										},

										get value() {
											return val();
										},

										get path() {
											return $$props.path;
										}
									});
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}