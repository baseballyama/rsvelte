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

export default function URLView($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 19, () => new URL('')),
		rest = $.rest_props($$props, rest_excludes);

	let hash = $.derived(() => value().hash),
		host = $.derived(() => value().host),
		hostname = $.derived(() => value().hostname),
		href = $.derived(() => value().href),
		origin = $.derived(() => value().origin),
		searchParams = $.derived(() => value().searchParams),
		password = $.derived(() => value().password),
		pathname = $.derived(() => value().pathname),
		port = $.derived(() => value().port),
		protocol = $.derived(() => value().protocol),
		username = $.derived(() => value().username);

	let entries = $.derived(() => Object.entries({
		protocol: $.get(protocol),
		username: $.get(username),
		password: $.get(password),
		host: $.get(host),
		port: $.get(port),
		pathname: $.get(pathname),
		hash: $.get(hash),
		hostname: $.get(hostname),
		origin: $.get(origin),
		href: $.get(href),
		searchParams: $.get(searchParams)
	}).filter((prop) => !!prop[1].toString()));

	{
		const valuePreview = ($$anchor) => {
			{
				let $0 = $.derived(() => value().toString());

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

		Expandable($$anchor, $.spread_props(
			() => ({
				value: value(),
				key: $$props.key,
				type: $$props.type,
				path: $$props.path
			}),
			{
				get length() {
					return $.get(entries).length;
				},
				showLength: false
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