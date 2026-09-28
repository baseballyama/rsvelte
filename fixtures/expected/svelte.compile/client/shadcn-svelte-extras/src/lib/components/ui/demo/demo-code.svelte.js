import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { Portal } from 'bits-ui';
import * as Code from '$lib/components/ui/code';
import { useDemoCode } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'code', 'class']);
var root = $.from_html(`<!> <!>`, 1);

export default function Demo_code($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const codeState = useDemoCode({ code: box.with(() => $$props.code) });
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('border-border rounded-md border', $$props.class));

		$.component(node, () => Tabs.Content, ($$anchor, Tabs_Content) => {
			Tabs_Content($$anchor, $.spread_props(
				{
					get id() {
						return `${uid}-code`;
					},
					value: 'code',
					get class() {
						return $.get($0);
					}
				},
				() => rest
			));
		});
	}

	var node_1 = $.sibling(node, 2);

	Portal(node_1, {
		get to() {
			return `#${uid}-code`;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.await(node_2, () => codeState.code, null, ($$anchor, code) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => Code.Root, ($$anchor, Code_Root) => {
					Code_Root($$anchor, {
						lang: 'svelte',
						get code() {
							return $.get(code);
						},
						class: 'aspect-video border-none [&_pre]:aspect-video',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
								Code_CopyButton($$anchor, {});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}