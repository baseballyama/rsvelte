import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Custom_animation($$anchor) {
	Progress($$anchor, {
		value: null,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Progress.Track, ($$anchor, Progress_Track) => {
				Progress_Track($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Progress.Range, ($$anchor, Progress_Range) => {
							Progress_Range($$anchor, { class: 'animate-[custom-animation_2s_ease-in-out_infinite]' });
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