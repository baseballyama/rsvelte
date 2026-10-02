import * as $ from 'svelte/internal/server';
import { Input } from '@svelteuidev/core';

const code = `<script>
    import { Input } from '@svelteuidev/core';
<\/script>

<Input variant='default' placeholder='Default variant' />
<Input variant='filled' placeholder='Filled variant' />
<Input variant='unstyled' placeholder='Unstyled variant' />`;

export const type = 'demo';
export const configuration = { code };

export default function Input_demo_variants($$renderer) {
	Input($$renderer, { variant: 'default', placeholder: 'Default variant' });
	$$renderer.push(`<!----> `);
	Input($$renderer, { variant: 'filled', placeholder: 'Filled variant' });
	$$renderer.push(`<!----> `);
	Input($$renderer, { variant: 'unstyled', placeholder: 'Unstyled variant' });
	$$renderer.push(`<!---->`);
}