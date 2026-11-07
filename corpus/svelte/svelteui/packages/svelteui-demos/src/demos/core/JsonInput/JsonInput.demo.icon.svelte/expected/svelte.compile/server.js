import * as $ from 'svelte/internal/server';
import { Center, JsonInput } from '@svelteuidev/core';
import { Gear } from 'radix-icons-svelte';

const code = `
<script lang="ts">
	import { Center, JsonInput } from '@svelteuidev/core';
	import { Gear } from 'radix-icons-svelte';
<\/script>

<Center>
	<JsonInput label="Robot Configuration" placeholder="Enter JSON data" icon={Gear} />
</Center>
`;

export const type = 'demo';
export const configuration = { code };

export default function JsonInput_demo_icon($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			JsonInput($$renderer, {
				label: 'Settings',
				placeholder: 'Enter JSON data',
				icon: Gear
			});
		},
		$$slots: { default: true }
	});
}