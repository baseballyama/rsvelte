import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function JsonInput_demo_icon($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			JsonInput($$anchor, {
				label: 'Settings',
				placeholder: 'Enter JSON data',
				get icon() {
					return Gear;
				}
			});
		},
		$$slots: { default: true }
	});
}