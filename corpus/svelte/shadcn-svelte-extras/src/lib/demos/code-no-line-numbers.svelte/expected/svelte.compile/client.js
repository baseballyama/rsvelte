import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Code_no_line_numbers($$anchor) {
	const code = `import * as Code from "$lib/components/ui/code";`;
	var div = root();
	var node = $.child(div);

	$.component(node, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, {
			lang: 'typescript',
			class: 'w-full',
			code,
			hideLines: true,
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
					Code_CopyButton($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}