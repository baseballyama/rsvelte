import * as $ from 'svelte/internal/server';
import * as Resizable from "$lib/registry/ui/resizable/index.js";

export default function Resizable_demo($$renderer) {
	if (Resizable.PaneGroup) {
		$$renderer.push('<!--[-->');

		Resizable.PaneGroup($$renderer, {
			direction: 'horizontal',
			class: 'max-w-md rounded-lg border',
			children: ($$renderer) => {
				if (Resizable.Pane) {
					$$renderer.push('<!--[-->');

					Resizable.Pane($$renderer, {
						defaultSize: 50,
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex h-[200px] items-center justify-center p-6"><span class="font-semibold">One</span></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Resizable.Handle) {
					$$renderer.push('<!--[-->');
					Resizable.Handle($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Resizable.Pane) {
					$$renderer.push('<!--[-->');

					Resizable.Pane($$renderer, {
						defaultSize: 50,
						children: ($$renderer) => {
							if (Resizable.PaneGroup) {
								$$renderer.push('<!--[-->');

								Resizable.PaneGroup($$renderer, {
									direction: 'vertical',
									children: ($$renderer) => {
										if (Resizable.Pane) {
											$$renderer.push('<!--[-->');

											Resizable.Pane($$renderer, {
												defaultSize: 25,
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Two</span></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Resizable.Handle) {
											$$renderer.push('<!--[-->');
											Resizable.Handle($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Resizable.Pane) {
											$$renderer.push('<!--[-->');

											Resizable.Pane($$renderer, {
												defaultSize: 75,
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex h-full items-center justify-center p-6"><span class="font-semibold">Three</span></div>`);
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
}