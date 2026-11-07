import * as $ from 'svelte/internal/server';
import { LinkPreview } from "bits-ui";

export default function Link_preview_test($$renderer, $$props) {
	let {
		open = false,
		contentProps,
		portalProps,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main data-testid="main">`);

		if (LinkPreview.Root) {
			$$renderer.push('<!--[-->');

			LinkPreview.Root($$renderer, $.spread_props([
				restProps,
				{
					openDelay: 0,
					closeDelay: 0,
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (LinkPreview.Trigger) {
							$$renderer.push('<!--[-->');

							LinkPreview.Trigger($$renderer, {
								'data-testid': 'trigger',
								href: 'https://github.com/sveltejs',
								target: '_blank',
								rel: 'noreferrer noopener',
								children: ($$renderer) => {
									$$renderer.push(`<!---->@sveltejs`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (LinkPreview.Portal) {
							$$renderer.push('<!--[-->');

							LinkPreview.Portal($$renderer, $.spread_props([
								portalProps,
								{
									children: ($$renderer) => {
										if (LinkPreview.Content) {
											$$renderer.push('<!--[-->');

											LinkPreview.Content($$renderer, $.spread_props([
												{ 'data-testid': 'content', class: 'w-80' },
												contentProps,
												{
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

		$$renderer.push(` <button data-testid="binding">${$.escape(open)}</button> <div data-testid="outside" class="ml-48">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}