import * as $ from 'svelte/internal/server';
import { Progress } from '@svelteuidev/core';

const code = `
<script>
	import { Progress } from '@svelteuidev/core';
<\/script>

<Progress
	sections={[
		{ value: 40, color: '#68b5e8' },
		{ value: 15, color: '#6888e8' },
		{ value: 15, color: '#8468e8' }
	]}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Progress_demo_colors($$renderer) {
	Progress($$renderer, {
		sections: [
			{ value: 40, color: '#68b5e8' },
			{ value: 15, color: '#6888e8' },
			{ value: 15, color: '#8468e8' }
		]
	});
}