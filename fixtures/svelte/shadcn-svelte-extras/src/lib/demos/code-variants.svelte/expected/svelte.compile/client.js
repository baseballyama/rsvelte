import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';

var root = $.from_html(`<div class="flex w-full flex-col gap-4 p-6"><!> <!></div>`);

export default function Code_variants($$anchor) {
	var div = root();
	var node = $.child(div);

	$.component(node, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, {
			lang: 'typescript',
			class: 'w-full',
			variant: 'secondary',
			hideLines: true,
			code: `import * as Code from "$lib/components/ui/code";`,
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

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Code.Root, ($$anchor, Code_Root_1) => {
		Code_Root_1($$anchor, {
			lang: 'svelte',
			class: 'w-full',
			variant: 'secondary',
			hideLines: true,
			code: `<Button variant="outline">
	Button
</Button>`,

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Code.CopyButton, ($$anchor, Code_CopyButton_1) => {
					Code_CopyButton_1($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}