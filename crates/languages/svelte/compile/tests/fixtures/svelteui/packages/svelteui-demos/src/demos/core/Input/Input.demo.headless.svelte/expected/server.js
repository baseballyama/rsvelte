import * as $ from 'svelte/internal/server';
import { Input } from '@svelteuidev/core';
import { MagnifyingGlass } from 'radix-icons-svelte';

const code = `<script>
    import { Input } from '@svelteuidev/core';
    import { MagnifyingGlass } from 'radix-icons-svelte';
<\/script>

<Input
    icon={MagnifyingGlass}
    variant="headless"
    placeholder="Add your own styles with styles API"
>
    <p slot="rightSection">$</p>
</Input>`;

export const type = 'demo';
export const configuration = { code };

export default function Input_demo_headless($$renderer) {
	Input($$renderer, {
		override: { input: { width: '100%', boxSizing: 'border-box' } },
		icon: MagnifyingGlass,
		variant: 'headless',
		placeholder: 'Add your own styles with styles API',
		$$slots: {
			rightSection: ($$renderer) => {
				$$renderer.push(`<p slot="rightSection">$</p>`);
			}
		}
	});
}