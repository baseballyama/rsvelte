import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-y-8 w-full"><!> <!> <!></div>`);

export default function Color($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Slider(node, {
		defaultValue: [50],
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Slider.Control, ($$anchor, Slider_Control) => {
				Slider_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Slider.Track, ($$anchor, Slider_Track) => {
							Slider_Track($$anchor, {
								class: 'bg-primary-50-950',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => Slider.Range, ($$anchor, Slider_Range) => {
										Slider_Range($$anchor, { class: 'bg-primary-500' });
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
							Slider_Thumb($$anchor, {
								index: 0,
								class: 'ring-primary-500',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_5 = $.first_child(fragment_3);

									$.component(node_5, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Slider(node_6, {
		defaultValue: [50],
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => Slider.Control, ($$anchor, Slider_Control_1) => {
				Slider_Control_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => Slider.Track, ($$anchor, Slider_Track_1) => {
							Slider_Track_1($$anchor, {
								class: 'bg-secondary-50-950',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_9 = $.first_child(fragment_6);

									$.component(node_9, () => Slider.Range, ($$anchor, Slider_Range_1) => {
										Slider_Range_1($$anchor, { class: 'bg-secondary-500' });
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_8, 2);

						$.component(node_10, () => Slider.Thumb, ($$anchor, Slider_Thumb_1) => {
							Slider_Thumb_1($$anchor, {
								index: 0,
								class: 'ring-secondary-500',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_11 = $.first_child(fragment_7);

									$.component(node_11, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput_1) => {
										Slider_HiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
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

	var node_12 = $.sibling(node_6, 2);

	Slider(node_12, {
		defaultValue: [50],
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = $.comment();
			var node_13 = $.first_child(fragment_8);

			$.component(node_13, () => Slider.Control, ($$anchor, Slider_Control_2) => {
				Slider_Control_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root();
						var node_14 = $.first_child(fragment_9);

						$.component(node_14, () => Slider.Track, ($$anchor, Slider_Track_2) => {
							Slider_Track_2($$anchor, {
								class: 'bg-tertiary-50-950',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = $.comment();
									var node_15 = $.first_child(fragment_10);

									$.component(node_15, () => Slider.Range, ($$anchor, Slider_Range_2) => {
										Slider_Range_2($$anchor, { class: 'bg-tertiary-500' });
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_14, 2);

						$.component(node_16, () => Slider.Thumb, ($$anchor, Slider_Thumb_2) => {
							Slider_Thumb_2($$anchor, {
								index: 0,
								class: 'ring-tertiary-500',
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = $.comment();
									var node_17 = $.first_child(fragment_11);

									$.component(node_17, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput_2) => {
										Slider_HiddenInput_2($$anchor, {});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}