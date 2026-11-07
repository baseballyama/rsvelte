import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Custom_value_text($$anchor, $$props) {
	$.push($$props, true);

	Progress($$anchor, {
		class: 'items-center w-fit',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Progress.Circle, ($$anchor, Progress_Circle) => {
				Progress_Circle($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack) => {
							Progress_CircleTrack($$anchor, {});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Progress.CircleRange, ($$anchor, Progress_CircleRange) => {
							Progress_CircleRange($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Progress.ValueText, ($$anchor, Progress_ValueText) => {
				Progress_ValueText($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							const children = ($$anchor, progress = $.noop) => {
								$.next();

								var text = $.text();

								$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''} of ${$1 ?? ''}`), [() => progress()().value, () => progress()().max]);
								$.append($$anchor, text);
							};

							$.component(node_4, () => Progress.Context, ($$anchor, Progress_Context) => {
								Progress_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_3);
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