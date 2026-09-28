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

export default function SetView($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let entries = $.derived(() => [...$$props.value.entries()].map(([_, v]) => v));
	let keys = $.derived(() => [...$.get(entries).keys()]);

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			Preview($$anchor, {
				get list() {
					return $.get(entries);
				},
				prefix: '{',
				postfix: '}',
				showKey: false,
				get showPreview() {
					return showPreview();
				}
			});
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

							Node($$anchor, {
								get path() {
									return $$props.path;
								},

								get key() {
									return index();
								},

								get value() {
									return $.get(entries)[key()];
								}
							});
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