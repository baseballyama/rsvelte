import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Divider } from '@svelteuidev/core';
import { MagnifyingGlass } from 'radix-icons-svelte';

const code = `
  <script>
    import { Divider } from '@svelteuidev/core';
    import { MagnifyingGlass } from 'radix-icons-svelte';
  <\/script>

  <Divider label='Label on the left' labelPosition='left' \/>
  <Divider label='Label in the center' labelPosition='center' \/>
  <Divider label='Label on the right' labelPosition='right' \/>
  <Divider labelPosition='center'>
    <div slot='label'>
      <MagnifyingGlass \/>
      <span>Search results<\/span>
    <\/div>
  <\/Divider>
  <Divider
    size='md'
    variant='dashed'
    label='Click here'
    labelPosition='left'
    labelProps={{ variant: 'link', href: 'https://svelteui.dev', root: 'a' }}
  \/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div slot="label"><!> <span style="vertical-align: middle;">Search results</span></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Divider_demo_label($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Divider(node, { label: 'Label on the left', labelPosition: 'left' });

	var node_1 = $.sibling(node, 2);

	Divider(node_1, { label: 'Label in the center', labelPosition: 'center' });

	var node_2 = $.sibling(node_1, 2);

	Divider(node_2, { label: 'Label on the right', labelPosition: 'right' });

	var node_3 = $.sibling(node_2, 2);

	Divider(node_3, {
		labelPosition: 'center',
		$$slots: {
			label: ($$anchor, $$slotProps) => {
				var div = root();
				var node_4 = $.child(div);

				MagnifyingGlass(node_4, {});
				$.next(2);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_5 = $.sibling(node_3, 2);

	Divider(node_5, {
		size: 'md',
		variant: 'dashed',
		label: 'Click here',
		labelPosition: 'left',
		labelProps: { variant: 'link', href: 'https://svelteui.dev', root: 'a' }
	});

	$.append($$anchor, fragment);
}