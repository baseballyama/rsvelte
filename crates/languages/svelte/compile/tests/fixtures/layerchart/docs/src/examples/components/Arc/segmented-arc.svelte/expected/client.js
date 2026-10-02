import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Layer, Text } from 'layerchart';
import { SpringValue } from 'svelte-ux';
import ArcControls from '$lib/components/controls/ArcControls.svelte';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!>`, 1);

export default function Segmented_arc($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(75);
	let segments = $.state(60);
	const data = { value: $.get(value), segments: $.get(segments) };
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	ArcControls(node, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		get segments() {
			return $.get(segments);
		},

		set segments($$value) {
			$.set(segments, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		height: 240,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					SpringValue($$anchor, {
						get value() {
							return $.get(value);
						},
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const value = $.derived(() => $$slotProps.value);
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								$.each(node_2, 17, () => ({ length: $.get(segments) }), $.index, ($$anchor, _, segmentIndex) => {
									const segmentAngle = $.derived(() => 2 * Math.PI / $.get(segments));

									{
										let $0 = $.derived(() => segmentIndex * $.get(segmentAngle));
										let $1 = $.derived(() => (segmentIndex + 1) * $.get(segmentAngle));
										let $2 = $.derived(() => cls(segmentIndex / $.get(segments) * 100 < ($.get(value) ?? 0) ? 'fill-success-300' : 'fill-surface-content/10'));

										Arc($$anchor, {
											get startAngle() {
												return $.get($0);
											},

											get endAngle() {
												return $.get($1);
											},
											innerRadius: -20,
											cornerRadius: 4,
											padAngle: 0.02,
											get class() {
												return $.get($2);
											}
										});
									}
								});

								var node_3 = $.sibling(node_2, 2);

								{
									let $0 = $.derived(() => Math.round($.get(value) ?? 0));

									Text(node_3, {
										get value() {
											return $.get($0);
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										dy: 16,
										class: 'text-6xl tabular-nums'
									});
								}

								$.append($$anchor, fragment_3);
							}
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}