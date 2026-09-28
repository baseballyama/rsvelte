import * as $ from 'svelte/internal/server';
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

export default function Divider_demo_label($$renderer) {
	Divider($$renderer, { label: 'Label on the left', labelPosition: 'left' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { label: 'Label in the center', labelPosition: 'center' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { label: 'Label on the right', labelPosition: 'right' });
	$$renderer.push(`<!----> `);

	Divider($$renderer, {
		labelPosition: 'center',
		$$slots: {
			label: ($$renderer) => {
				$$renderer.push(`<div slot="label">`);
				MagnifyingGlass($$renderer, {});
				$$renderer.push(`<!----> <span style="vertical-align: middle;">Search results</span></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Divider($$renderer, {
		size: 'md',
		variant: 'dashed',
		label: 'Click here',
		labelPosition: 'left',
		labelProps: { variant: 'link', href: 'https://svelteui.dev', root: 'a' }
	});

	$$renderer.push(`<!---->`);
}