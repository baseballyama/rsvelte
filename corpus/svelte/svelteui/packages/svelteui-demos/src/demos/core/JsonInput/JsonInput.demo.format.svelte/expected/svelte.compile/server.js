import * as $ from 'svelte/internal/server';
import { Center, JsonInput } from '@svelteuidev/core';

const code = `
<script lang="ts">
	import { Center, JsonInput } from '@svelteuidev/core';
<\/script>

<Center>
	<JsonInput label="Data" placeholder="Enter data" formatOnBlur />
</Center>
`;

export const type = 'demo';
export const configuration = { code };

export default function JsonInput_demo_format($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			JsonInput($$renderer, { label: 'Data', placeholder: 'Enter data', formatOnBlur: true });
		},
		$$slots: { default: true }
	});
}