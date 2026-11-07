import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor) {
	Slider($$anchor, {
		defaultValue: [50],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Slider.Label, ($$anchor, Slider_Label) => {
				Slider_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Slider.Control, ($$anchor, Slider_Control) => {
				Slider_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Slider.Track, ($$anchor, Slider_Track) => {
							Slider_Track($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Slider.Range, ($$anchor, Slider_Range) => {
										Slider_Range($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
							Slider_Thumb($$anchor, {
								index: 0,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
										Slider_HiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_1, 2);

			$.component(node_6, () => Slider.MarkerGroup, ($$anchor, Slider_MarkerGroup) => {
				Slider_MarkerGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_7 = $.first_child(fragment_5);

						$.component(node_7, () => Slider.Marker, ($$anchor, Slider_Marker) => {
							Slider_Marker($$anchor, { value: 25 });
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Slider.Marker, ($$anchor, Slider_Marker_1) => {
							Slider_Marker_1($$anchor, { value: 50 });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Slider.Marker, ($$anchor, Slider_Marker_2) => {
							Slider_Marker_2($$anchor, { value: 75 });
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}