import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Divider } from '@svelteuidev/core';

const code = `
  <script>
    import { Divider } from '@svelteuidev/core';
  <\/script>

  <Divider />
  <Divider variant='dashed' />
  <Divider variant='dotted' />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Divider_demo_usage($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Divider(node, {});

	var node_1 = $.sibling(node, 2);

	Divider(node_1, { variant: 'dashed' });

	var node_2 = $.sibling(node_1, 2);

	Divider(node_2, { variant: 'dotted' });
	$.append($$anchor, fragment);
}