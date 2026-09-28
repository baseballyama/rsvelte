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

export default function MapEntryView($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, undefined),
		path = $.prop($$props, 'path', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;

			{
				let $0 = $.derived(() => [[$$props.value[0], $$props.value[1]]]);

				Preview($$anchor, {
					get keyValue() {
						return $.get($0);
					},
					prefix: '{',
					postfix: '}',
					keyDelim: '=>',
					keyStyle: 'margin-right: 0.5em;',
					get showPreview() {
						return showPreview();
					}
				});
			}
		};

		Expandable($$anchor, $.spread_props(
			{
				get key() {
					return key();
				},
				type: '',
				get value() {
					return $$props.value;
				},

				get path() {
					return path();
				},
				length: 2,
				showLength: false,
				keepPreviewOnExpand: true
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Entry(node, {
						i: 0,
						children: ($$anchor, $$slotProps) => {
							Node($$anchor, {
								key: 'key',
								get value() {
									return $$props.value[0];
								},

								get path() {
									return path();
								}
							});
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Entry(node_1, {
						i: 1,
						children: ($$anchor, $$slotProps) => {
							Node($$anchor, {
								key: 'value',
								get value() {
									return $$props.value[1];
								},

								get path() {
									return path();
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}