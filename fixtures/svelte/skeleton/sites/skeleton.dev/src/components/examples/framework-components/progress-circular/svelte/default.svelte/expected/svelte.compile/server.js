import * as $ from 'svelte/internal/server';
import { Progress, Slider } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	let value = 50;

	$$renderer.push(`<div class="flex flex-col gap-8 items-center">`);

	Progress($$renderer, {
		value,
		class: 'items-center w-fit',
		children: ($$renderer) => {
			if (Progress.Label) {
				$$renderer.push('<!--[-->');

				Progress.Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Progress`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Progress.Circle) {
				$$renderer.push('<!--[-->');

				Progress.Circle($$renderer, {
					children: ($$renderer) => {
						if (Progress.CircleTrack) {
							$$renderer.push('<!--[-->');
							Progress.CircleTrack($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Progress.CircleRange) {
							$$renderer.push('<!--[-->');
							Progress.CircleRange($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Progress.ValueText) {
				$$renderer.push('<!--[-->');
				Progress.ValueText($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		class: 'w-full',
		value: [value],
		onValueChange: (e) => value = e.value[0],
		step: 10,
		children: ($$renderer) => {
			if (Slider.Control) {
				$$renderer.push('<!--[-->');

				Slider.Control($$renderer, {
					children: ($$renderer) => {
						if (Slider.Track) {
							$$renderer.push('<!--[-->');

							Slider.Track($$renderer, {
								children: ($$renderer) => {
									if (Slider.Range) {
										$$renderer.push('<!--[-->');
										Slider.Range($$renderer, { class: 'bg-transparent' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Slider.Thumb) {
							$$renderer.push('<!--[-->');

							Slider.Thumb($$renderer, {
								index: 0,
								children: ($$renderer) => {
									if (Slider.HiddenInput) {
										$$renderer.push('<!--[-->');
										Slider.HiddenInput($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}