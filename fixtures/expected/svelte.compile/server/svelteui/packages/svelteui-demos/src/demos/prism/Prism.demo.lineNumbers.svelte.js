import * as $ from 'svelte/internal/server';
import { Box } from '@svelteuidev/core';
import { Prism } from '@svelteuidev/prism';

const demoCode = `
    <script>
        import { Button } from '@svelteuidev/core'
    <\/script>

    <Button>Hello</Button>
    `;

const code = `
    <script>
        import { Prism } from '@svelteuidev/prism'

        const demoCode = \`
        <script>
            import { Button } from '@svelteuidev/core'
        <\/script>

        <Button>Hello</Button>
        \`
    <\/script>

    <Prism lineNumbers language='svelte' code={demoCode} />
	`;

export const type = 'demo';
export const configuration = { code };

export default function Prism_demo_lineNumbers($$renderer) {
	Box($$renderer, {
		css: { pre: { bc: '$gray50' }, 'pre code': { color: '$gray900' } },
		children: ($$renderer) => {
			Prism($$renderer, { lineNumbers: true, language: 'svelte', code: demoCode });
		},
		$$slots: { default: true }
	});
}