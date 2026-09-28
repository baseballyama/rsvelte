import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Code_1($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
					Code_CopyButton($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}