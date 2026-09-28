import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPreviewLevel } from '../contexts.js';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'path',
	'type',
	'showKey'
]);

export default function ArrayView($$anchor, $$props) {
	$.push($$props, true);

	let array = $.prop($$props, 'value', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	const previewLevel = getPreviewLevel();

	let otherprops = $.derived(() => getAllProperties(array()).filter((prop) => {
		if (typeof prop === 'string') {
			return (/\d+/).test(prop) === false && prop !== 'length';
		}

		return true;
	}));

	let keys = $.derived(() => [...array().keys(), ...$.get(otherprops)]);

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			Preview($$anchor, {
				get path() {
					return $$props.path;
				},

				get list() {
					return array();
				},
				prefix: '[',
				postfix: ']',
				get showPreview() {
					return showPreview();
				},
				showKey: false
			});
		};

		let $0 = $.derived(() => $$props.showKey && previewLevel === 0);

		Expandable($$anchor, $.spread_props(
			{
				get value() {
					return array();
				},

				get length() {
					return array().length;
				},

				get type() {
					return $$props.type;
				},

				get path() {
					return $$props.path;
				},

				get showKey() {
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

							{
								let $0 = $.derived(() => array()?.[key()]);

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

						PropertyList($$anchor, {
							get value() {
								return array();
							},

							get type() {
								return $$props.type;
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