import * as $ from 'svelte/internal/server';
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

export default function JsonInput_demo_disabled($$renderer) {
	const sampleJson = '{"tasks": ["dancing", "taking over the world"]}';

	Center($$renderer, {
		children: ($$renderer) => {
			JsonInput($$renderer, {
				disabled: true,
				label: 'Robot configuration',
				value: sampleJson
			});
		},
		$$slots: { default: true }
	});
}