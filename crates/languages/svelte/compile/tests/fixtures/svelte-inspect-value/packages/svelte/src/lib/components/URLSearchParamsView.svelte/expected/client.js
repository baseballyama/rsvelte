import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'key', 'path']);

export default function URLSearchParamsView($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 19, () => new URLSearchParams()),
		key = $.prop($$props, 'key', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let entries = $.derived(() => {
		let entries = {};

		for (const key of value().keys()) {
			if (!Object.hasOwn(entries, key)) {
				const all = value().getAll(key);

				if (all.length === 1) {
					entries[key] = all[0];
				} else {
					entries[key] = all;
				}
			}
		}

		return Object.entries(entries);
	});

	let preview = $.derived(() => $.get(entries).slice(0, 3));

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			Preview($$anchor, {
				get keyValue() {
					return $.get(preview);
				},
				prefix: '{',
				postfix: '}',
				get showPreview() {
					return showPreview();
				}
			});
		};

		Expandable($$anchor, $.spread_props(
			() => ({ value: value(), key: key(), path: $$props.path }),
			{
				get length() {
					return value().size;
				}
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 19, () => $.get(entries), ([key, value]) => key, ($$anchor, $$item, i, $$array) => {
						var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
						let key = () => $.get($$array_1)[0];
						let value = () => $.get($$array_1)[1];

						Entry($$anchor, {
							get i() {
								return $.get(i);
							},

							children: ($$anchor, $$slotProps) => {
								Node($$anchor, {
									get value() {
										return value();
									},

									get key() {
										return key();
									},

									get path() {
										return $$props.path;
									}
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}