import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';

export default function Code_highlight_lines($$renderer) {
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

	$$renderer.push(`<div class="w-full p-6">`);

	if (Code.Root) {
		$$renderer.push('<!--[-->');

		Code.Root($$renderer, {
			lang: 'typescript',
			code,
			highlight: [[3, 4], [10, 13]],
			children: ($$renderer) => {
				if (Code.CopyButton) {
					$$renderer.push('<!--[-->');
					Code.CopyButton($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}