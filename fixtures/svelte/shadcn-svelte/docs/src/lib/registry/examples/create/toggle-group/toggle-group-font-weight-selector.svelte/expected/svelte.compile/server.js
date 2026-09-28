import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_font_weight_selector($$renderer) {
	let fontWeight = "normal";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Font Weight Selector',
			children: ($$renderer) => {
				if (Field.Field) {
					$$renderer.push('<!--[-->');

					Field.Field($$renderer, {
						children: ($$renderer) => {
							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Font Weight`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ToggleGroup.Root) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Root($$renderer, {
									type: 'single',
									variant: 'outline',
									spacing: 2,
									size: 'lg',
									get value() {
										return fontWeight;
									},

									set value($$value) {
										fontWeight = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (ToggleGroup.Item) {
											$$renderer.push('<!--[-->');

											ToggleGroup.Item($$renderer, {
												value: 'light',
												'aria-label': 'Light',
												class: 'flex size-16 flex-col items-center justify-center rounded-xl',
												children: ($$renderer) => {
													$$renderer.push(`<span class="text-2xl leading-none font-light">Aa</span> <span class="text-xs text-muted-foreground">Light</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ToggleGroup.Item) {
											$$renderer.push('<!--[-->');

											ToggleGroup.Item($$renderer, {
												value: 'normal',
												'aria-label': 'Normal',
												class: 'flex size-16 flex-col items-center justify-center rounded-xl',
												children: ($$renderer) => {
													$$renderer.push(`<span class="text-2xl leading-none font-normal">Aa</span> <span class="text-xs text-muted-foreground">Normal</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ToggleGroup.Item) {
											$$renderer.push('<!--[-->');

											ToggleGroup.Item($$renderer, {
												value: 'medium',
												'aria-label': 'Medium',
												class: 'flex size-16 flex-col items-center justify-center rounded-xl',
												children: ($$renderer) => {
													$$renderer.push(`<span class="text-2xl leading-none font-medium">Aa</span> <span class="text-xs text-muted-foreground">Medium</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ToggleGroup.Item) {
											$$renderer.push('<!--[-->');

											ToggleGroup.Item($$renderer, {
												value: 'bold',
												'aria-label': 'Bold',
												class: 'flex size-16 flex-col items-center justify-center rounded-xl',
												children: ($$renderer) => {
													$$renderer.push(`<span class="text-2xl leading-none font-bold">Aa</span> <span class="text-xs text-muted-foreground">Bold</span>`);
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

							if (Field.Description) {
								$$renderer.push('<!--[-->');

								Field.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Use <code class="rounded-md bg-muted px-1 py-0.5 font-mono">font-${$.escape(fontWeight)}</code> to set the font weight.`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}