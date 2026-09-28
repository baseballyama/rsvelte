import * as $ from 'svelte/internal/server';
import * as Terminal from '$lib/components/ui/terminal';

export default function Terminal_1($$renderer) {
	if (Terminal.Root) {
		$$renderer.push('<!--[-->');

		Terminal.Root($$renderer, {
			class: 'm-6 max-w-xl',
			delay: 250,
			children: ($$renderer) => {
				if (Terminal.TypingAnimation) {
					$$renderer.push('<!--[-->');

					Terminal.TypingAnimation($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->> jsrepo add ui/terminal`);
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
						$$renderer.push(`<!---->Fetching manifest`);
					}

					function completeMessage($$renderer) {
						$$renderer.push(`<span class="text-green-500">✔ Retrieved blocks from github/ieedan/shadcn-svelte-extras</span>`);
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

				{
					function loadingMessage($$renderer) {
						$$renderer.push(`<!---->Adding ui/terminal`);
					}

					function completeMessage($$renderer) {
						$$renderer.push(`<span class="text-green-500">✔ Added ui/terminal</span>`);
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

				{
					function loadingMessage($$renderer) {
						$$renderer.push(`<!---->Installing dependencies`);
					}

					function completeMessage($$renderer) {
						$$renderer.push(`<span class="text-green-500">✔ Installed runed@^0.23.4</span>`);
					}

					if (Terminal.Loading) {
						$$renderer.push('<!--[-->');

						Terminal.Loading($$renderer, {
							delay: 4000,
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
						delay: 5250,
						class: 'text-green-500',
						children: ($$renderer) => {
							$$renderer.push(`<span>✔ All done.</span>`);
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