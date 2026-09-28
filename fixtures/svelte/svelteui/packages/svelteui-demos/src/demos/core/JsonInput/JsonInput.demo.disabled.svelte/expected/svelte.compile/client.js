import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, JsonInput } from '@svelteuidev/core';

const code = `
<script lang="ts">
	import { Center, JsonInput } from '@svelteuidev/core';

	const sampleJson = '{"tasks": ["dancing", "taking over the world"]}';
<\/script>

<Center>
	<JsonInput disabled label="Disabled with value" value={sampleJson} />
</Center>
`;

export const type = 'demo';
export const configuration = { code };

export default function JsonInput_demo_disabled($$anchor) {
	const sampleJson = '{"tasks": ["dancing", "taking over the world"]}';

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			JsonInput($$anchor, {
				disabled: true,
				label: 'Robot configuration',
				value: sampleJson
			});
		},
		$$slots: { default: true }
	});
}