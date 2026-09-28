import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p slot="rightSection">$</p>`);

export default function Input_demo_headless($$anchor) {
	Input($$anchor, {
		override: { input: { width: '100%', boxSizing: 'border-box' } },
		get icon() {
			return MagnifyingGlass;
		},
		variant: 'headless',
		placeholder: 'Add your own styles with styles API',
		$$slots: {
			rightSection: ($$anchor, $$slotProps) => {
				var p = root();

				$.append($$anchor, p);
			}
		}
	});
}