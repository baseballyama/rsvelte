import * as $ from 'svelte/internal/server';
import { Progress } from '@svelteuidev/core';

const code = `
<script>
	import { Progress } from '@svelteuidev/core';
<\/script>

<Progress
	size="xl"
	sections={[
		{ value: 40, color: 'cyan' },
		{ value: 20, color: 'blue' },
		{ value: 15, color: 'indigo' }
	]}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Progress_demo_sections($$renderer) {
	Progress($$renderer, {
		size: 'xl',
		sections: [
			{ value: 40, color: 'cyan' },
			{ value: 20, color: 'blue' },
			{ value: 15, color: 'indigo' }
		]
	});
}