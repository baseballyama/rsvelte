import * as $ from 'svelte/internal/server';
import { Box } from '@svelteuidev/core';
import { Prism } from '@svelteuidev/prism';

const code = `<script>
    import { Prism } from '@svelteuidev/prism';
<\/script>

<Prism language='svelte' code={prismExampleCode} />
`;

export const type = 'demo';
export const configuration = { code };

export default function Code_demo_prism($$renderer) {
	const prismExampleCode = `
    <script>
        import { Button } from '@svelteuidev/core';
    <\/script>

    <Button>Hello<\/Button>
    `;

	Box($$renderer, {
		css: { pre: { bc: '$gray50' }, 'pre code': { color: '$gray900' } },
		children: ($$renderer) => {
			Prism($$renderer, { language: 'svelte', code: prismExampleCode });
		},
		$$slots: { default: true }
	});
}