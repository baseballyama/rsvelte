import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_test($$renderer, $$props) {
	let {
		open = false,
		portalProps,
		contentProps,
		providerProps,
		triggerProps,
		withCustomAnchor = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let customAnchor = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main data-testid="main">`);

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, $.spread_props([
				{ delayDuration: 0 },
				providerProps,
				{
					children: ($$renderer) => {
						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');

							Tooltip.Root($$renderer, $.spread_props([
								restProps,
								{
									get open() {
										return open;
									},

									set open($$value) {
										open = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Tooltip.Trigger) {
											$$renderer.push('<!--[-->');

											Tooltip.Trigger($$renderer, $.spread_props([
												{ 'data-testid': 'trigger' },
												triggerProps,
												{
													children: ($$renderer) => {
														$$renderer.push(`<!---->@sveltejs`);
													},
													$$slots: { default: true }
												}
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Portal) {
											$$renderer.push('<!--[-->');

											Tooltip.Portal($$renderer, $.spread_props([
												portalProps,
												{
													children: ($$renderer) => {
														if (Tooltip.Content) {
															$$renderer.push('<!--[-->');

															Tooltip.Content($$renderer, $.spread_props([
																contentProps,
																{
																	customAnchor: withCustomAnchor ? customAnchor : undefined,
																	'data-testid': 'content',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Content`);
																	},
																	$$slots: { default: true }
																}
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												}
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <button data-testid="binding">${$.escape(open)}</button> <div class="h-96"></div> <div data-testid="outside">outside</div> <div data-testid="custom-anchor">Content</div></main> <div data-testid="portal-target" id="portal-target"></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}