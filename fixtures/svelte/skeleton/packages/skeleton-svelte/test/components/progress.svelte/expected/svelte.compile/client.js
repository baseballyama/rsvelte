import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Progress_1($$anchor) {
	Progress($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Progress.Label, ($$anchor, Progress_Label) => {
				Progress_Label($$anchor, {
					'data-testid': 'label',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Progress.ValueText, ($$anchor, Progress_ValueText) => {
							Progress_ValueText($$anchor, { 'data-testid': 'value-text' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Progress.Track, ($$anchor, Progress_Track) => {
				Progress_Track($$anchor, {
					'data-testid': 'track',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => Progress.Range, ($$anchor, Progress_Range) => {
							Progress_Range($$anchor, { 'data-testid': 'range' });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_2, 2);

			$.component(node_4, () => Progress.Circle, ($$anchor, Progress_Circle) => {
				Progress_Circle($$anchor, {
					'data-testid': 'circle',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_5 = $.first_child(fragment_4);

						$.component(node_5, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack) => {
							Progress_CircleTrack($$anchor, { 'data-testid': 'circle-track' });
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => Progress.CircleRange, ($$anchor, Progress_CircleRange) => {
							Progress_CircleRange($$anchor, { 'data-testid': 'circle-range' });
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}