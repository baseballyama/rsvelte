import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Divider } from '@svelteuidev/core';

const code = `
  <script>
    import { Divider } from '@svelteuidev/core';
  <\/script>

  <Divider size="xs" />
  <Divider size="sm" />
  <Divider size="md" />
  <Divider size="lg" />
  <Divider size="xl" />
  <Divider size={10} />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Divider_demo_size($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Divider(node, { size: 'xs' });

	var node_1 = $.sibling(node, 2);

	Divider(node_1, { size: 'sm' });

	var node_2 = $.sibling(node_1, 2);

	Divider(node_2, { size: 'md' });

	var node_3 = $.sibling(node_2, 2);

	Divider(node_3, { size: 'lg' });

	var node_4 = $.sibling(node_3, 2);

	Divider(node_4, { size: 'xl' });

	var node_5 = $.sibling(node_4, 2);

	Divider(node_5, { size: 10 });
	$.append($$anchor, fragment);
}