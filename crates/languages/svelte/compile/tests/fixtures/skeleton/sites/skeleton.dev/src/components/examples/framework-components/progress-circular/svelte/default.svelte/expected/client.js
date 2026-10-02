import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress, Slider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-8 items-center"><!> <!></div>`);

export default function Default($$anchor) {
	let value = $.state(50);
	var div = root_2();
	var node = $.child(div);

	Progress(node, {
		get value() {
			return $.get(value);
		},
		class: 'items-center w-fit',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Progress.Label, ($$anchor, Progress_Label) => {
				Progress_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Progress');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Progress.Circle, ($$anchor, Progress_Circle) => {
				Progress_Circle($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack) => {
							Progress_CircleTrack($$anchor, {});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Progress.CircleRange, ($$anchor, Progress_CircleRange) => {
							Progress_CircleRange($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_2, 2);

			$.component(node_5, () => Progress.ValueText, ($$anchor, Progress_ValueText) => {
				Progress_ValueText($$anchor, {});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [$.get(value)]);

		Slider(node_6, {
			class: 'w-full',
			get value() {
				return $.get($0);
			},
			onValueChange: (e) => $.set(value, e.value[0], true),
			step: 10,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_7 = $.first_child(fragment_2);

				$.component(node_7, () => Slider.Control, ($$anchor, Slider_Control) => {
					Slider_Control($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_8 = $.first_child(fragment_3);

							$.component(node_8, () => Slider.Track, ($$anchor, Slider_Track) => {
								Slider_Track($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_9 = $.first_child(fragment_4);

										$.component(node_9, () => Slider.Range, ($$anchor, Slider_Range) => {
											Slider_Range($$anchor, { class: 'bg-transparent' });
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_8, 2);

							$.component(node_10, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
								Slider_Thumb($$anchor, {
									index: 0,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_11 = $.first_child(fragment_5);

										$.component(node_11, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
											Slider_HiddenInput($$anchor, {});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
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
	}

	$.reset(div);
	$.append($$anchor, div);
}