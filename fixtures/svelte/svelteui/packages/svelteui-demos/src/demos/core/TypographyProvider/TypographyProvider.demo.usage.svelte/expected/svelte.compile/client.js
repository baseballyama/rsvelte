import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const code = `
<script>
    import SvelteMarkdown from 'svelte-markdown'
    import { TypographyProvider } from '@svelteuidev/core';

    const markdown = \`
    # This is a title
    \`
<\/script>

<TypographyProvider>
    <SvelteMarkdown source={markdown} />
</TypographyProvider>
`;

export const type = 'demo';
export const configuration = { code };

export default function TypographyProvider_demo_usage($$anchor) {}