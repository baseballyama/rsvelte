import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function Skeleton_demo_content($$anchor) {
	let loading = true;

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Skeleton(node, {
				get visible() {
					return loading;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi dolor nihil amet tempore magnam\n		optio, numquam nostrum inventore tempora assumenda saepe, aut repellat. Temporibus aspernatur\n		aperiam magnam debitis facere odio? Laborum fuga quam voluptas aut pariatur delectus repudiandae\n		commodi tempora debitis dolores vero cumque magni cum, deserunt, ad tempore consectetur libero\n		molestias similique nemo eum! Dolore maxime voluptate inventore atque.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				$$events: { click: () => loading = !loading },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Toggle Skeleton');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}