import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-4 justify-evenly items-center w-full"><!> <!> <!></div>`);

export default function Size($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Progress(node, {
		value: 75,
		class: 'w-fit',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Progress.Circle, ($$anchor, Progress_Circle) => {
				Progress_Circle($$anchor, {
					class: '[--size:--spacing(12)]',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack) => {
							Progress_CircleTrack($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Progress.CircleRange, ($$anchor, Progress_CircleRange) => {
							Progress_CircleRange($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Progress(node_4, {
		value: 75,
		class: 'w-fit',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			$.component(node_5, () => Progress.Circle, ($$anchor, Progress_Circle_1) => {
				Progress_Circle_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_6 = $.first_child(fragment_3);

						$.component(node_6, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack_1) => {
							Progress_CircleTrack_1($$anchor, {});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Progress.CircleRange, ($$anchor, Progress_CircleRange_1) => {
							Progress_CircleRange_1($$anchor, {});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	Progress(node_8, {
		value: 75,
		class: 'w-fit',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_9 = $.first_child(fragment_4);

			$.component(node_9, () => Progress.Circle, ($$anchor, Progress_Circle_2) => {
				Progress_Circle_2($$anchor, {
					class: '[--size:--spacing(32)]',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_10 = $.first_child(fragment_5);

						$.component(node_10, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack_2) => {
							Progress_CircleTrack_2($$anchor, {});
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => Progress.CircleRange, ($$anchor, Progress_CircleRange_2) => {
							Progress_CircleRange_2($$anchor, {});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}