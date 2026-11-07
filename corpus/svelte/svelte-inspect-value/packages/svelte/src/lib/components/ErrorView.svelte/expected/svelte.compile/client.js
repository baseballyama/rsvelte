import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import StringValue from './StringValue.svelte';

export default function ErrorView($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, 'error');
	let useDefaults = getContext(Symbol.for('siv.use-defaults'));

	let entries = $.derived(() => Object.entries({
		name: $$props.value.name,
		message: $$props.value.message,
		stack: $$props.value.stack,
		cause: $$props.value.cause
	}).filter(([, v]) => v != null));

	{
		const valuePreview = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.value.toString());

				StringValue($$anchor, {
					get type() {
						return type();
					},

					get value() {
						return $.get($0);
					}
				});
			}
		};

		Expandable($$anchor, {
			get value() {
				return $$props.value;
			},

			get key() {
				return $$props.key;
			},

			get type() {
				return type();
			},

			get path() {
				return $$props.path;
			},

			get length() {
				return $.get(entries).length;
			},
			keepPreviewOnExpand: true,
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
							{
								let $0 = $.derived(() => useDefaults ?? false);

								Node($$anchor, {
									get value() {
										return value();
									},

									get key() {
										return key();
									},

									get path() {
										return $$props.path;
									},

									get usedefaults() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { valuePreview: true, default: true }
		});
	}

	$.pop();
}