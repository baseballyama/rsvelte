import * as $ from 'svelte/internal/server';
import { Slider } from '@skeletonlabs/skeleton-svelte';

export default function Color($$renderer) {
	$$renderer.push(`<div class="space-y-8 w-full">`);

	Slider($$renderer, {
		defaultValue: [50],
		children: ($$renderer) => {
			if (Slider.Control) {
				$$renderer.push('<!--[-->');

				Slider.Control($$renderer, {
					children: ($$renderer) => {
						if (Slider.Track) {
							$$renderer.push('<!--[-->');

							Slider.Track($$renderer, {
								class: 'bg-primary-50-950',
								children: ($$renderer) => {
									if (Slider.Range) {
										$$renderer.push('<!--[-->');
										Slider.Range($$renderer, { class: 'bg-primary-500' });
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
								class: 'ring-primary-500',
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

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		defaultValue: [50],
		children: ($$renderer) => {
			if (Slider.Control) {
				$$renderer.push('<!--[-->');

				Slider.Control($$renderer, {
					children: ($$renderer) => {
						if (Slider.Track) {
							$$renderer.push('<!--[-->');

							Slider.Track($$renderer, {
								class: 'bg-secondary-50-950',
								children: ($$renderer) => {
									if (Slider.Range) {
										$$renderer.push('<!--[-->');
										Slider.Range($$renderer, { class: 'bg-secondary-500' });
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
								class: 'ring-secondary-500',
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

	$$renderer.push(`<!----> `);

	Slider($$renderer, {
		defaultValue: [50],
		children: ($$renderer) => {
			if (Slider.Control) {
				$$renderer.push('<!--[-->');

				Slider.Control($$renderer, {
					children: ($$renderer) => {
						if (Slider.Track) {
							$$renderer.push('<!--[-->');

							Slider.Track($$renderer, {
								class: 'bg-tertiary-50-950',
								children: ($$renderer) => {
									if (Slider.Range) {
										$$renderer.push('<!--[-->');
										Slider.Range($$renderer, { class: 'bg-tertiary-500' });
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
								class: 'ring-tertiary-500',
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