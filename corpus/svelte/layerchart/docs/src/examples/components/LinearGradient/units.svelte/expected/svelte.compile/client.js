import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, LinearGradient, Rect } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="overflow-x-auto max-w-full"><!></div>`);

export default function Units($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Chart(node, {
		height: 320,
		width: 700,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 16, () => ({ length: 6 }), $.index, ($$anchor, _, i) => {
								Rect($$anchor, {
									x: 0 + i * 120,
									y: 0,
									width: 100,
									height: 140,
									rx: 8,
									get fill() {
										return gradient();
									}
								});
							});

							$.append($$anchor, fragment_2);
						};

						LinearGradient(node_1, {
							class: 'from-green-500 to-blue-500',
							units: 'objectBoundingBox',
							children,
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.each(node_4, 16, () => ({ length: 6 }), $.index, ($$anchor, _, i) => {
								Rect($$anchor, {
									x: 0 + i * 120,
									y: 160,
									width: 100,
									height: 140,
									rx: 8,
									get fill() {
										return gradient();
									}
								});
							});

							$.append($$anchor, fragment_4);
						};

						LinearGradient(node_3, {
							class: 'from-green-500 to-blue-500',
							units: 'userSpaceOnUse',
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}