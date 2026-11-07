import * as $ from 'svelte/internal/server';
import * as Password from '$lib/components/ui/password';

export default function Password_strength($$renderer) {
	const SCORE_NAMING = ['Poor', 'Weak', 'Average', 'Strong', 'Secure'];
	let strength = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex w-full max-w-3xs flex-col gap-2">`);

		if (Password.Root) {
			$$renderer.push('<!--[-->');

			Password.Root($$renderer, {
				minScore: 2,
				children: ($$renderer) => {
					if (Password.Input) {
						$$renderer.push('<!--[-->');

						Password.Input($$renderer, {
							value: '$ecretpa$$word',
							children: ($$renderer) => {
								if (Password.ToggleVisibility) {
									$$renderer.push('<!--[-->');
									Password.ToggleVisibility($$renderer, {});
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

					$$renderer.push(` <div class="flex flex-col gap-1">`);

					if (Password.Strength) {
						$$renderer.push('<!--[-->');

						Password.Strength($$renderer, {
							get strength() {
								return strength;
							},

							set strength($$value) {
								strength = $$value;
								$$settled = false;
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="text-muted-foreground text-sm">${$.escape(SCORE_NAMING[strength?.score ?? 0])}</span></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}