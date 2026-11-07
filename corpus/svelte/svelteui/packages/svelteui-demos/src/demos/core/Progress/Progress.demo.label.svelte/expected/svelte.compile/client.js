import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Progress_demo_label($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progress(node, { value: 75, label: '75%', size: 'xl', radius: 'xl' });

	var node_1 = $.sibling(node, 2);

	Space(node_1, { h: 'md' });

	var node_2 = $.sibling(node_1, 2);

	Progress(node_2, {
		size: 'xl',
		radius: 'xl',
		sections: [
			{ value: 30, color: 'pink', label: 'Documents' },
			{ value: 30, color: 'grape', label: 'Apps' },
			{ value: 25, color: 'violet', label: 'Other' }
		]
	});

	$.append($$anchor, fragment);
}