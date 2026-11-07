import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Expandable from './Expandable.svelte';
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

export default function MapView($$anchor, $$props) {
	$.push($$props, true);

	let path = $.prop($$props, 'path', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	let keys = $.derived(() => [...$$props.value.keys()]);
	let entries = $.derived(() => [...$$props.value.entries()]);

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			Preview($$anchor, {
				get keyValue() {
					return $.get(entries);
				},
				prefix: '{',
				postfix: '}',
				keyDelim: '=>',
				keyStyle: 'margin-right: 0.5em;',
				get showPreview() {
					return showPreview();
				}
			});
		};

		Expandable($$anchor, $.spread_props(
			{
				get value() {
					return $$props.value;
				},

				get key() {
					return $$props.key;
				},

				get type() {
					return $$props.type;
				},

				get path() {
					return path();
				},

				get length() {
					return $.get(entries).length;
				}
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					{
						const item = ($$anchor, $$arg0) => {
							let key = () => ($$arg0?.()).key;
							let index = () => ($$arg0?.()).index;

							{
								let $0 = $.derived(() => [key(), $$props.value.get(key())]);

								Node($$anchor, {
									forceView: 'mapentry',
									get path() {
										return path();
									},

									get key() {
										return index();
									},

									get value() {
										return $.get($0);
									}
								});
							}
						};

						PropertyList($$anchor, {
							get value() {
								return $$props.value;
							},

							get keys() {
								return $.get(keys);
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