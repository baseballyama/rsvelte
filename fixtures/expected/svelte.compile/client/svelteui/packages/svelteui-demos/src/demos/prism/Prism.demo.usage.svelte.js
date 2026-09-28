import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

    <Prism language='svelte' code={demoCode} />
	`;

export const type = 'demo';
export const configuration = { code };

export default function Prism_demo_usage($$anchor) {
	Box($$anchor, {
		css: { pre: { bc: '$gray50' }, 'pre code': { color: '$gray900' } },
		children: ($$anchor, $$slotProps) => {
			Prism($$anchor, { language: 'svelte', code: demoCode });
		},
		$$slots: { default: true }
	});
}