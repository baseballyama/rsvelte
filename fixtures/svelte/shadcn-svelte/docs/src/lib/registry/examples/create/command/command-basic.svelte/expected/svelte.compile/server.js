import * as $ from 'svelte/internal/server';
import * as Command from "$lib/registry/ui/command/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Command_basic($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Basic',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col gap-4">`);

				Button($$renderer, {
					onclick: () => open = true,
					variant: 'outline',
					class: 'w-fit',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Menu`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (Command.Dialog) {
					$$renderer.push('<!--[-->');

					Command.Dialog($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Command.Input) {
								$$renderer.push('<!--[-->');
								Command.Input($$renderer, { placeholder: 'Type a command or search...' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Command.List) {
								$$renderer.push('<!--[-->');

								Command.List($$renderer, {
									children: ($$renderer) => {
										if (Command.Empty) {
											$$renderer.push('<!--[-->');

											Command.Empty($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->No results found.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: 'Suggestions',
												children: ($$renderer) => {
													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Calendar`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Search Emoji`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.Item) {
														$$renderer.push('<!--[-->');

														Command.Item($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Calculator`);
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

				$$renderer.push(`</div>`);
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