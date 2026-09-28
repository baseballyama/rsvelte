import * as $ from 'svelte/internal/server';
import * as Terminal from '$lib/components/ui/terminal';

export default function Terminal_1($$renderer) {
	if (Terminal.Loop) {
		$$renderer.push('<!--[-->');

		Terminal.Loop($$renderer, {
			delay: 5000,
			children: ($$renderer) => {
				if (Terminal.Root) {
					$$renderer.push('<!--[-->');

					Terminal.Root($$renderer, {
						class: 'h-[275px] leading-5',
						children: ($$renderer) => {
							if (Terminal.TypingAnimation) {
								$$renderer.push('<!--[-->');

								Terminal.TypingAnimation($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->jsrepo add ui/terminal`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <br/> `);

							if (Terminal.AnimatedSpan) {
								$$renderer.push('<!--[-->');

								Terminal.AnimatedSpan($$renderer, {
									delay: 1400,
									children: ($$renderer) => {
										$$renderer.push(`<span class="text-muted-foreground">┌</span> <span class="bg-yellow-400 px-2 text-black">jsrepo</span> <span class="text-muted-foreground">v1.0.0</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Terminal.AnimatedSpan) {
								$$renderer.push('<!--[-->');

								Terminal.AnimatedSpan($$renderer, {
									delay: 1450,
									class: 'text-muted-foreground',
									children: ($$renderer) => {
										$$renderer.push(`<!---->│`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							{
								function loadingMessage($$renderer) {
									$$renderer.push(`<!---->Fetching manifest from <span class="text-cyan-500">shadcn-svelte-extras</span>`);
								}

								function completeMessage($$renderer) {
									$$renderer.push(`<span class="text-green-500">◇</span> Fetched manifest from <span class="text-cyan-500">shadcn-svelte-extras</span>`);
								}

								if (Terminal.Loading) {
									$$renderer.push('<!--[-->');

									Terminal.Loading($$renderer, {
										delay: 1500,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Terminal.AnimatedSpan) {
								$$renderer.push('<!--[-->');

								Terminal.AnimatedSpan($$renderer, {
									delay: 2650,
									class: 'text-muted-foreground',
									children: ($$renderer) => {
										$$renderer.push(`<!---->│`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							{
								function loadingMessage($$renderer) {
									$$renderer.push(`<!---->Adding <span class="text-cyan-500">ui/terminal</span>`);
								}

								function completeMessage($$renderer) {
									$$renderer.push(`<span class="text-green-500">◇</span> Added <span class="text-cyan-500">ui/terminal</span>`);
								}

								if (Terminal.Loading) {
									$$renderer.push('<!--[-->');

									Terminal.Loading($$renderer, {
										delay: 2750,
										loadingMessage,
										completeMessage,
										$$slots: { loadingMessage: true, completeMessage: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Terminal.AnimatedSpan) {
								$$renderer.push('<!--[-->');

								Terminal.AnimatedSpan($$renderer, {
									delay: 3850,
									class: 'text-muted-foreground',
									children: ($$renderer) => {
										$$renderer.push(`<!---->│`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Terminal.AnimatedSpan) {
								$$renderer.push('<!--[-->');

								Terminal.AnimatedSpan($$renderer, {
									delay: 3900,
									class: 'text-green-500',
									children: ($$renderer) => {
										$$renderer.push(`<span class="text-muted-foreground">└</span> ✓ All done!`);
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