import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, JsonInput } from '@svelteuidev/core';

const code = `
<script lang="ts">
	import { Center, JsonInput } from '@svelteuidev/core';
<\/script>

<Center>
	<JsonInput label="Validate" validationError="Invalid data" />
</Center>
`;

export const type = 'demo';
export const configuration = { code };

export default function JsonInput_demo_validation($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			JsonInput($$anchor, { label: 'Valid data', validationError: 'Invalid data' });
		},
		$$slots: { default: true }
	});
}