import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '@svelteuidev/core';

const code = `<script>
    import { Input } from '@svelteuidev/core';
<\/script>

<Input variant='default' placeholder='Default variant' />
<Input variant='filled' placeholder='Filled variant' />
<Input variant='unstyled' placeholder='Unstyled variant' />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Input_demo_variants($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Input(node, { variant: 'default', placeholder: 'Default variant' });

	var node_1 = $.sibling(node, 2);

	Input(node_1, { variant: 'filled', placeholder: 'Filled variant' });

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, { variant: 'unstyled', placeholder: 'Unstyled variant' });
	$.append($$anchor, fragment);
}