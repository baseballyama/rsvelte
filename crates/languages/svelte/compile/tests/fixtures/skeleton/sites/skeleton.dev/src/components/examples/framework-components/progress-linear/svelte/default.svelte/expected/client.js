import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress, Slider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full space-y-8"><!> <!></div>`);

export default function Default($$anchor) {
	let value = $.state(75);
	var div = root_1();
	var node = $.child(div);

	Progress(node, {
		get value() {
			return $.get(value);
		},
		class: 'grid grid-cols-[auto_1fr] items-center gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Progress.Label, ($$anchor, Progress_Label) => {
				Progress_Label($$anchor, {
					class: 'text-sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, `${$.get(value) ?? ''}%`));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Progress.Track, ($$anchor, Progress_Track) => {
				Progress_Track($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Progress.Range, ($$anchor, Progress_Range) => {
							Progress_Range($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [$.get(value)]);

		Slider(node_4, {
			class: 'w-32 mx-auto',
			get value() {
				return $.get($0);
			},
			onValueChange: (e) => $.set(value, e.value[0], true),
			step: 10,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => Slider.Control, ($$anchor, Slider_Control) => {
					Slider_Control($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Slider.Track, ($$anchor, Slider_Track) => {
								Slider_Track($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Slider.Range, ($$anchor, Slider_Range) => {
											Slider_Range($$anchor, { class: 'bg-transparent' });
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_6, 2);

							$.component(node_8, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
								Slider_Thumb($$anchor, {
									index: 0,
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_9 = $.first_child(fragment_6);

										$.component(node_9, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
											Slider_HiddenInput($$anchor, {});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}