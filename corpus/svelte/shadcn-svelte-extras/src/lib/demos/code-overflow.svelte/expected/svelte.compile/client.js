import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';
import codeCode from '$lib/components/ui/code/code.svelte?raw';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Code_overflow($$anchor) {
	var div = root();
	var node = $.child(div);

	$.component(node, () => Code.Overflow, ($$anchor, Code_Overflow) => {
		Code_Overflow($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Code.Root, ($$anchor, Code_Root) => {
					Code_Root($$anchor, {
						lang: 'svelte',
						get code() {
							return codeCode;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
								Code_CopyButton($$anchor, {});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}