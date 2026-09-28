import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Roller_shades($$renderer) {
	let position = [50];

	const preset = $.derived(() => {
		const p = position[0];

		if (p <= 10) return "open";
		if (p >= 90) return "closed";

		return "half";
	});

	function onPresetChange(v) {
		if (v == "open") {
			position = [0];
		} else if (v == "half") {
			position = [50];
		} else if (v == "closed") {
			position = [100];
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Living Room`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Roller Shades`);
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

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-4',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex h-32 flex-col overflow-hidden rounded-lg border bg-muted"><div class="bg-muted-foreground transition-all duration-300"${$.attr_style('', { height: `${$.stringify(position[0])}%` })}></div></div> <div class="flex items-center gap-3"><span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Open</span> `);

								Slider($$renderer, {
									type: 'multiple',
									max: 100,
									class: 'flex-1',
									get value() {
										return position;
									},

									set value($$value) {
										position = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> <span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Close</span></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								if (ToggleGroup.Root) {
									$$renderer.push('<!--[-->');

									ToggleGroup.Root($$renderer, {
										type: 'single',
										value: preset(),
										onValueChange: onPresetChange,
										variant: 'outline',
										spacing: 1,
										class: 'w-full',
										children: ($$renderer) => {
											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'open',
													class: 'flex-1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Open`);
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
													value: 'half',
													class: 'flex-1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Half`);
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
													value: 'closed',
													class: 'flex-1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Closed`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}