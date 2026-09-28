import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layout } from '@appwrite.io/pink-svelte';
import ColumnItem from './columns/columnItem.svelte';
import { toRelationalField } from '$database/(entity)';

export default function RelatedRowColumns($$anchor, $$props) {
	$.push($$props, true);

	const $workStore = () => $.store_get($$props.workStore, '$workStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let gap = $.prop($$props, 'gap', 3, 'l');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			direction: 'column',
			get gap() {
				return gap();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => $$props.columnsToRender, $.index, ($$anchor, column) => {
					const label = $.derived(() => $.get(column).key);

					{
						let $0 = $.derived(() => toRelationalField($.get(column)));

						ColumnItem($$anchor, {
							get label() {
								return $.get(label);
							},
							editing: true,
							get formValues() {
								return $workStore();
							},

							get column() {
								return $.get($0);
							},

							get onUpdateFormValues() {
								return $$props.onUpdateFormValues;
							}
						});
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}