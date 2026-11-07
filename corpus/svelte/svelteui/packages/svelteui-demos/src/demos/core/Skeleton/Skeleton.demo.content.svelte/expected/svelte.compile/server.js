import * as $ from 'svelte/internal/server';
import { Button, Skeleton, Stack } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Skeleton } from '@svelteuidev/core';

  let loading = false;
<\/script>

<Skeleton visible={loading}>
    Lorem ipsum dolor sit amet...
</Skeleton>
<Button on:click={() => (loading = !loading)}>
    Toggle Skeleton
</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Skeleton_demo_content($$renderer) {
	let loading = true;

	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			Skeleton($$renderer, {
				visible: loading,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi dolor nihil amet tempore magnam
		optio, numquam nostrum inventore tempora assumenda saepe, aut repellat. Temporibus aspernatur
		aperiam magnam debitis facere odio? Laborum fuga quam voluptas aut pariatur delectus repudiandae
		commodi tempora debitis dolores vero cumque magni cum, deserunt, ad tempore consectetur libero
		molestias similique nemo eum! Dolore maxime voluptate inventore atque.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle Skeleton`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}