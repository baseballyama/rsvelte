import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Slider_1($$anchor) {
	Slider($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Slider.Label, ($$anchor, Slider_Label) => {
				Slider_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Slider.ValueText, ($$anchor, Slider_ValueText) => {
				Slider_ValueText($$anchor, { 'data-testid': 'value-text' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Slider.Control, ($$anchor, Slider_Control) => {
				Slider_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Slider.Track, ($$anchor, Slider_Track) => {
							Slider_Track($$anchor, {
								'data-testid': 'track',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Slider.Range, ($$anchor, Slider_Range) => {
										Slider_Range($$anchor, { 'data-testid': 'range' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
							Slider_Thumb($$anchor, {
								index: 0,
								'data-testid': 'thumb',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
										Slider_HiddenInput($$anchor, { 'data-testid': 'hidden-input' });
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

			var node_7 = $.sibling(node_2, 2);

			$.component(node_7, () => Slider.MarkerGroup, ($$anchor, Slider_MarkerGroup) => {
				Slider_MarkerGroup($$anchor, {
					'data-testid': 'marker-group',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => Slider.Marker, ($$anchor, Slider_Marker) => {
							Slider_Marker($$anchor, { value: 0, 'data-testid': 'marker' });
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