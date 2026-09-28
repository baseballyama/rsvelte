import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Code_highlight_lines($$anchor) {
	const code = `export type Language = 
| 'English (US)' 
| 'English (UK)' 
| 'Español (MX)';
	
export const greet = (name: string, language: Language): string => {
	switch (language) {
		case 'English (US)':
			return \`Hello \${name}!\`
		case 'English (UK)':
			return \`Hello \${name}, mate!\` 
		case 'Español (MX)':
			return \`¡Hola \${name}!\`
	}
}`;

	var div = root();
	var node = $.child(div);

	$.component(node, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, {
			lang: 'typescript',
			code,
			highlight: [[3, 4], [10, 13]],
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