import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<div class="flex w-full flex-col gap-8"><!> <!> <!></div>`);

export default function Color($$anchor) {
	var div = root();
	var node = $.child(div);

	Progress(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Progress.Track, ($$anchor, Progress_Track) => {
				Progress_Track($$anchor, {
					class: 'bg-primary-50-950',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Progress.Range, ($$anchor, Progress_Range) => {
							Progress_Range($$anchor, { class: 'bg-primary-500' });
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

	var node_3 = $.sibling(node, 2);

	Progress(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => Progress.Track, ($$anchor, Progress_Track_1) => {
				Progress_Track_1($$anchor, {
					class: 'bg-secondary-50-950',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => Progress.Range, ($$anchor, Progress_Range_1) => {
							Progress_Range_1($$anchor, { class: 'bg-secondary-500' });
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

	var node_6 = $.sibling(node_3, 2);

	Progress(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => Progress.Track, ($$anchor, Progress_Track_2) => {
				Progress_Track_2($$anchor, {
					class: 'bg-tertiary-50-950',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => Progress.Range, ($$anchor, Progress_Range_2) => {
							Progress_Range_2($$anchor, { class: 'bg-tertiary-500' });
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