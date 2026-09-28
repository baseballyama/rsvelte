import * as $ from 'svelte/internal/server';
import { Progress, Space } from '@svelteuidev/core';

const code = `
<script>
    import { Progress } from '@svelteuidev/core';
<\/script>

<Progress value={75} label="75%" size="xl" radius="xl" />
<Progress
    mt='md'
    size="xl"
    radius="xl"
    sections={[
        { value: 30, color: 'pink', label: 'Documents' },
        { value: 30, color: 'grape', label: 'Apps' },
        { value: 25, color: 'violet', label: 'Other' },
    ]}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Progress_demo_label($$renderer) {
	Progress($$renderer, { value: 75, label: '75%', size: 'xl', radius: 'xl' });
	$$renderer.push(`<!----> `);
	Space($$renderer, { h: 'md' });
	$$renderer.push(`<!----> `);

	Progress($$renderer, {
		size: 'xl',
		radius: 'xl',
		sections: [
			{ value: 30, color: 'pink', label: 'Documents' },
			{ value: 30, color: 'grape', label: 'Apps' },
			{ value: 25, color: 'violet', label: 'Other' }
		]
	});

	$$renderer.push(`<!---->`);
}