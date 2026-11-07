import * as $ from 'svelte/internal/server';
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

export default function Divider_demo_size($$renderer) {
	Divider($$renderer, { size: 'xs' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { size: 'sm' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { size: 'md' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { size: 'lg' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { size: 'xl' });
	$$renderer.push(`<!----> `);
	Divider($$renderer, { size: 10 });
	$$renderer.push(`<!---->`);
}