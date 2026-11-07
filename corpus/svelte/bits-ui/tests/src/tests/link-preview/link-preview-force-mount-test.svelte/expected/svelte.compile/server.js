import * as $ from 'svelte/internal/server';

function Content($$renderer, { props, wrapperProps }) {
	$$renderer.push(`<div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>Content</div></div>`);
}

import { LinkPreview } from "bits-ui";

export default function Link_preview_force_mount_test($$renderer, $$props) {
	let {
		open = false,
		contentProps,
		portalProps,
		withOpenCheck = false,
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
					openDelay: 50,
					closeDelay: 50,
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
										if (withOpenCheck) {
											$$renderer.push('<!--[0-->');

											{
												function child($$renderer, props) {
													if (props.open) {
														$$renderer.push('<!--[0-->');
														Content($$renderer, props);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}

												if (LinkPreview.Content) {
													$$renderer.push('<!--[-->');

													LinkPreview.Content($$renderer, $.spread_props([
														{ 'data-testid': 'content', class: 'w-80' },
														contentProps,
														{ forceMount: true, child, $$slots: { child: true } }
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										} else {
											$$renderer.push('<!--[-1-->');

											{
												function child($$renderer, props) {
													Content($$renderer, props);
												}

												if (LinkPreview.Content) {
													$$renderer.push('<!--[-->');

													LinkPreview.Content($$renderer, $.spread_props([
														{ 'data-testid': 'content', class: 'w-80' },
														contentProps,
														{ forceMount: true, child, $$slots: { child: true } }
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										}

										$$renderer.push(`<!--]-->`);
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

		$$renderer.push(` <button data-testid="binding">${$.escape(open)}</button> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}