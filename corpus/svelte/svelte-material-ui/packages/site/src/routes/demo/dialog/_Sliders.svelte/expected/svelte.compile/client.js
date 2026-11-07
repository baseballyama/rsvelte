import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import Slider from '@smui/slider';
import FormField from '@smui/form-field';

var root = $.from_html(`<div><!></div> <div><!></div> <div><!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _Sliders($$anchor) {
	let open = $.state(false);
	let volumeMedia = $.state(100);
	let volumeRingtone = $.state(80);
	let volumeAlarm = $.state(80);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Dialog(node, {
		'aria-labelledby': 'slider-title',
		'aria-describedby': 'slider-content',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'slider-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Volumes');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'slider-content',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div = $.first_child(fragment_2);
					var node_3 = $.child(div);

					{
						const label = ($$anchor) => {
							$.next();

							var text_1 = $.text('Media Volume');

							$.append($$anchor, text_1);
						};

						FormField(node_3, {
							style: 'display: flex; flex-direction: column-reverse;',
							label,
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => [InitialFocus]);

									Slider($$anchor, {
										get use() {
											return $.get($0);
										},
										style: 'width: 100%;',
										get value() {
											return $.get(volumeMedia);
										},

										set value($$value) {
											$.set(volumeMedia, $$value, true);
										}
									});
								}
							},
							$$slots: { label: true, default: true }
						});
					}

					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var node_4 = $.child(div_1);

					{
						const label = ($$anchor) => {
							$.next();

							var text_2 = $.text('Ringtone Volume');

							$.append($$anchor, text_2);
						};

						FormField(node_4, {
							style: 'display: flex; flex-direction: column-reverse;',
							label,
							children: ($$anchor, $$slotProps) => {
								Slider($$anchor, {
									style: 'width: 100%;',
									get value() {
										return $.get(volumeRingtone);
									},

									set value($$value) {
										$.set(volumeRingtone, $$value, true);
									}
								});
							},
							$$slots: { label: true, default: true }
						});
					}

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_5 = $.child(div_2);

					{
						const label = ($$anchor) => {
							$.next();

							var text_3 = $.text('Alarm Volume');

							$.append($$anchor, text_3);
						};

						FormField(node_5, {
							style: 'display: flex; flex-direction: column-reverse;',
							label,
							children: ($$anchor, $$slotProps) => {
								Slider($$anchor, {
									style: 'width: 100%;',
									get value() {
										return $.get(volumeAlarm);
									},

									set value($$value) {
										$.set(volumeAlarm, $$value, true);
									}
								});
							},
							$$slots: { label: true, default: true }
						});
					}

					$.reset(div_2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_2, 2);

			Actions(node_6, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						action: 'accept',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Done');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	Button(node_7, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Open Dialog');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}