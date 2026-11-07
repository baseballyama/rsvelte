import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="absolute inset-0 flex items-center justify-center"><!></div> <!>`, 1);

export default function Centered_content($$anchor) {
	Progress($$anchor, {
		class: 'w-fit relative',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			$.component(node, () => Progress.ValueText, ($$anchor, Progress_ValueText) => {
				Progress_ValueText($$anchor, {});
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			$.component(node_1, () => Progress.Circle, ($$anchor, Progress_Circle) => {
				Progress_Circle($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack) => {
							Progress_CircleTrack($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Progress.CircleRange, ($$anchor, Progress_CircleRange) => {
							Progress_CircleRange($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}