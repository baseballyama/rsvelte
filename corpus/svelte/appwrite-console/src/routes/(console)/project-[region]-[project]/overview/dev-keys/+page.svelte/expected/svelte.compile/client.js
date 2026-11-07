import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setOverviewAction } from '../context';
import Table from '../(components)/table.svelte';
import { Alert, Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(
	`As of July 22, 2026, creating new dev keys is paused. Existing dev keys keep working
            until September 1, 2026. Learn more in the <a href="https://appwrite.io/changelog/entry/2026-07-22" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">changelog</a>.`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	setOverviewAction(null);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'l',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Alert.Inline, ($$anchor, Alert_Inline) => {
					Alert_Inline($$anchor, {
						status: 'warning',
						title: 'Dev keys are deprecated',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
								Typography_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();

										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				Table(node_3, {
					get keys() {
						return $$props.data.devKeys;
					},
					keyType: 'dev'
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}