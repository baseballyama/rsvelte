import * as $ from 'svelte/internal/server';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';

export default function Tooltip_1($$renderer, $$props) {
	const { tooltip, children, shortCut } = $$props;

	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			delayDuration: 100,
			children: ($$renderer) => {
				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						children: ($$renderer) => {
							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');

								Tooltip.Trigger($$renderer, {
									children: ($$renderer) => {
										children($$renderer);
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.Content) {
								$$renderer.push('<!--[-->');

								Tooltip.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<span>${$.escape(tooltip)}</span> `);

										if (shortCut) {
											$$renderer.push(`<!--[0--><span class="rounded bg-background p-0.5 text-primary">${$.escape(shortCut)}</span>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
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