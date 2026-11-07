import * as $ from 'svelte/internal/server';
import { Progress, Slider } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	let value = 75;

	$$renderer.push(`<div class="w-full space-y-8">`);

	Progress($$renderer, {
		value,
		class: 'grid grid-cols-[auto_1fr] items-center gap-4',
		children: ($$renderer) => {
			if (Progress.Label) {
				$$renderer.push('<!--[-->');

				Progress.Label($$renderer, {
					class: 'text-sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(value)}%`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					children: ($$renderer) => {
						if (Progress.Range) {
							$$renderer.push('<!--[-->');
							Progress.Range($$renderer, {});
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

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		class: 'w-32 mx-auto',
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