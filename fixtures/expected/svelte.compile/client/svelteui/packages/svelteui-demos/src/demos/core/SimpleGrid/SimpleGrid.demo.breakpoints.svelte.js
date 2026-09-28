import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, SimpleGrid } from '@svelteuidev/core';

const code = `<script>
	import { SimpleGrid } from '@svelteuidev/core';
<\/script>

<SimpleGrid
    breakpoints={[
        { maxWidth: 980, cols: 3, spacing: 'md' },
        { maxWidth: 755, cols: 2, spacing: 'sm' },
        { maxWidth: 600, cols: 1, spacing: 'sm' }
    ]}
    cols={3}
>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
</SimpleGrid>
`;

export const type = 'demo';
export const configuration = { code };

export default function SimpleGrid_demo_breakpoints($$anchor, $$props) {
	$.push($$props, true);

	SimpleGrid($$anchor, {
		breakpoints: [
			{ maxWidth: 980, cols: 3, spacing: 'md' },
			{ maxWidth: 755, cols: 2, spacing: 'sm' },
			{ maxWidth: 600, cols: 1, spacing: 'sm' }
		],
		cols: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => [...Array(5).keys()], $.index, ($$anchor, _, i) => {
				Center($$anchor, {
					override: { bc: 'AliceBlue', padding: '$12', color: '$blue600' },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						text.nodeValue = i + 1;
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}