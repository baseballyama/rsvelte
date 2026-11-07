import * as $ from 'svelte/internal/server';
import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import Slider from '@smui/slider';
import FormField from '@smui/form-field';

export default function _Sliders($$renderer) {
	let open = false;
	let volumeMedia = 100;
	let volumeRingtone = 80;
	let volumeAlarm = 80;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			'aria-labelledby': 'slider-title',
			'aria-describedby': 'slider-content',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Title($$renderer, {
					id: 'slider-title',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Volumes`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'slider-content',
					children: ($$renderer) => {
						$$renderer.push(`<div>`);

						{
							function label($$renderer) {
								$$renderer.push(`<!---->Media Volume`);
							}

							FormField($$renderer, {
								style: 'display: flex; flex-direction: column-reverse;',
								label,
								children: ($$renderer) => {
									Slider($$renderer, {
										use: [InitialFocus],
										style: 'width: 100%;',
										get value() {
											return volumeMedia;
										},

										set value($$value) {
											volumeMedia = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { label: true, default: true }
							});
						}

						$$renderer.push(`<!----></div> <div>`);

						{
							function label($$renderer) {
								$$renderer.push(`<!---->Ringtone Volume`);
							}

							FormField($$renderer, {
								style: 'display: flex; flex-direction: column-reverse;',
								label,
								children: ($$renderer) => {
									Slider($$renderer, {
										style: 'width: 100%;',
										get value() {
											return volumeRingtone;
										},

										set value($$value) {
											volumeRingtone = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { label: true, default: true }
							});
						}

						$$renderer.push(`<!----></div> <div>`);

						{
							function label($$renderer) {
								$$renderer.push(`<!---->Alarm Volume`);
							}

							FormField($$renderer, {
								style: 'display: flex; flex-direction: column-reverse;',
								label,
								children: ($$renderer) => {
									Slider($$renderer, {
										style: 'width: 100%;',
										get value() {
											return volumeAlarm;
										},

										set value($$value) {
											volumeAlarm = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { label: true, default: true }
							});
						}

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							action: 'accept',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Done`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => open = true,
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Dialog`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}