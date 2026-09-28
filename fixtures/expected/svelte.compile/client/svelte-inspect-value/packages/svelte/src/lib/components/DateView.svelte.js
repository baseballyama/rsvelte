import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import StringValue from './StringValue.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path'
]);

export default function DateView($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	let entries = $.derived(() => Object.entries({
		toString: $$props.value.toString(),
		dateString: $$props.value.toDateString(),
		utcString: $$props.value.toUTCString(),
		year: $$props.value.getFullYear(),
		month: $$props.value.getMonth(),
		date: $$props.value.getDate(),
		day: $$props.value.getDay(),
		hour: $$props.value.getHours(),
		minutes: $$props.value.getMinutes(),
		seconds: $$props.value.getSeconds(),
		milliseconds: $$props.value.getMilliseconds(),
		time: $$props.value.getTime()
	}));

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.value.toUTCString());

						StringValue($$anchor, {
							get type() {
								return $$props.type;
							},

							get value() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node, ($$render) => {
					if (showPreview()) $$render(consequent);
				});
			}

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
					return $.get(entries).length;
				},
				keepPreviewOnExpand: true,
				showLength: false
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_1 = $.first_child(fragment_3);

					$.each(node_1, 19, () => $.get(entries), ([key, value]) => key, ($$anchor, $$item, i, $$array) => {
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

					$.append($$anchor, fragment_3);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}