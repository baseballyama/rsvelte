import * as $ from 'svelte/internal/server';
import { Slider } from '@skeletonlabs/skeleton-svelte';

export default function Dir($$renderer) {
	Slider($$renderer, {
		defaultValue: [50],
		dir: 'rtl',
		children: ($$renderer) => {
			if (Slider.Label) {
				$$renderer.push('<!--[-->');

				Slider.Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

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
										Slider.Range($$renderer, {});
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

			$$renderer.push(` `);

			if (Slider.MarkerGroup) {
				$$renderer.push('<!--[-->');

				Slider.MarkerGroup($$renderer, {
					children: ($$renderer) => {
						if (Slider.Marker) {
							$$renderer.push('<!--[-->');
							Slider.Marker($$renderer, { value: 25 });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Slider.Marker) {
							$$renderer.push('<!--[-->');
							Slider.Marker($$renderer, { value: 50 });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Slider.Marker) {
							$$renderer.push('<!--[-->');
							Slider.Marker($$renderer, { value: 75 });
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
}