import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, Image, Text } from '@svelteuidev/core';

const code = `<script>
    import { Image, Text } from '@svelteuidev/core';
<\/script>

<Image width={200} height={120} src={null} alt='Without placeholder' />
<Image width={200} height={120} src={null} alt='With default placeholder' usePlaceholder />
<Image width={200} height={120} src={null} alt='With default placeholder' usePlaceholder>
    <svelte:fragment slot='placeholder'>
        <Text>This image would have changed your life</Text>
    </svelte:fragment>
</Image>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Image_demo_placeholder($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Image(node, {
				width: 200,
				height: 120,
				src: null,
				alt: 'Without placeholder'
			});

			var node_1 = $.sibling(node, 2);

			Image(node_1, {
				width: 200,
				height: 120,
				src: null,
				alt: 'With default placeholder',
				usePlaceholder: true
			});

			var node_2 = $.sibling(node_1, 2);

			Image(node_2, {
				width: 200,
				height: 120,
				src: null,
				alt: 'With default placeholder',
				usePlaceholder: true,
				$$slots: {
					placeholder: ($$anchor, $$slotProps) => {
						Text($$anchor, {
							align: 'center',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('This image would have changed your life');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}