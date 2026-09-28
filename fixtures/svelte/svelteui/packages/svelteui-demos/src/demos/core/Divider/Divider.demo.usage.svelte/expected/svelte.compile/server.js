import * as $ from 'svelte/internal/server';
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

export default function Divider_demo_usage($$renderer) {
	Divider($$renderer, {});
	$$renderer.push(`<!----> `);
	Divider($$renderer, { variant: 'dashed' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { variant: 'dotted' });
	$$renderer.push(`<!---->`);
}