import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputText } from '$lib/elements/forms';
import { Layout } from '@appwrite.io/pink-svelte';
import { getTerminologies } from '$database/(entity)';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Overview($$anchor, $$props) {
	$.push($$props, true);

	let selectedIndex = $.prop($$props, 'selectedIndex', 3, null);
	const { terminology } = getTerminologies();
	const fieldLabel = terminology.field.title.singular;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => selectedIndex()?.key ?? '');

		InputText(node, {
			required: true,
			id: 'key',
			label: 'Index key',
			placeholder: 'Enter key',
			get value() {
				return $.get($0);
			},
			readonly: true
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => selectedIndex()?.type ?? '');

		InputText(node_1, {
			required: true,
			id: 'type',
			label: 'Index type',
			placeholder: 'Select type',
			get value() {
				return $.get($0);
			},
			readonly: true
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.each(node_3, 17, () => selectedIndex().fields, $.index, ($$anchor, field, i) => {
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => i === 0 ? fieldLabel : '');
								let $1 = $.derived(() => `value-${$.get(field)}`);

								InputText(node_5, {
									required: true,
									get label() {
										return $.get($0);
									},

									get id() {
										return $.get($1);
									},

									get value() {
										return $.get(field);
									},
									readonly: true
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => `value-${selectedIndex()?.orders?.[i] ?? ''}`);
								let $1 = $.derived(() => selectedIndex()?.orders?.[i] ?? '');

								InputText(node_6, {
									required: true,
									label: i === 0 ? 'Order' : '',
									get id() {
										return $.get($0);
									},

									get value() {
										return $.get($1);
									},
									readonly: true
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								let $0 = $.derived(() => `value-${selectedIndex()?.lengths?.[i] ?? ''}`);
								let $1 = $.derived(() => selectedIndex().lengths[i]?.toString() ?? null);

								InputText(node_7, {
									required: true,
									label: i === 0 ? 'Length' : '',
									get id() {
										return $.get($0);
									},

									get value() {
										return $.get($1);
									},
									readonly: true
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (selectedIndex()?.fields?.length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}