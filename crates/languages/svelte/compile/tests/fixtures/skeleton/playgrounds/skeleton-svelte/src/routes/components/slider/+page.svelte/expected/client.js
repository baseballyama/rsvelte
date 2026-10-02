import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-8"><p>Above</p> <!> <p>Below</p></div>`);

export default function _page($$anchor) {
	var div = root_3();
	var node = $.sibling($.child(div), 2);

	Slider(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Slider.Label, ($$anchor, Slider_Label) => {
				Slider_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Slider.Control, ($$anchor, Slider_Control) => {
				Slider_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Slider.Track, ($$anchor, Slider_Track) => {
							Slider_Track($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Slider.Range, ($$anchor, Slider_Range) => {
										Slider_Range($$anchor, {});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
							Slider_Thumb($$anchor, {
								index: 0,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_6 = $.first_child(fragment_3);

									$.component(node_6, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
										Slider_HiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_2, 2);

			$.component(node_7, () => Slider.MarkerGroup, ($$anchor, Slider_MarkerGroup) => {
				Slider_MarkerGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_8 = $.first_child(fragment_4);

						$.component(node_8, () => Slider.Marker, ($$anchor, Slider_Marker) => {
							Slider_Marker($$anchor, { value: 0 });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Slider.Marker, ($$anchor, Slider_Marker_1) => {
							Slider_Marker_1($$anchor, { value: 25 });
						});

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => Slider.Marker, ($$anchor, Slider_Marker_2) => {
							Slider_Marker_2($$anchor, { value: 50 });
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => Slider.Marker, ($$anchor, Slider_Marker_3) => {
							Slider_Marker_3($$anchor, { value: 75 });
						});

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => Slider.Marker, ($$anchor, Slider_Marker_4) => {
							Slider_Marker_4($$anchor, { value: 100 });
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}