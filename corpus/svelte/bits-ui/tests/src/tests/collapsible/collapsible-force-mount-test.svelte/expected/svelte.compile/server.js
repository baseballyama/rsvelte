import * as $ from 'svelte/internal/server';
import { Collapsible } from "bits-ui";

export default function Collapsible_force_mount_test($$renderer, $$props) {
	let {
		open = false,
		withOpenCheck = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><p data-testid="binding">${$.escape(open)}</p> `);

		if (Collapsible.Root) {
			$$renderer.push('<!--[-->');

			Collapsible.Root($$renderer, $.spread_props([
				{ 'data-testid': 'root' },
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
						if (Collapsible.Trigger) {
							$$renderer.push('<!--[-->');

							Collapsible.Trigger($$renderer, {
								'data-testid': 'trigger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Trigger`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (withOpenCheck) {
							$$renderer.push('<!--[0-->');

							{
								function child($$renderer, { props, open }) {
									if (open) {
										$$renderer.push(`<!--[0--><div${$.attributes({ ...props })}>Content</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Collapsible.Content) {
									$$renderer.push('<!--[-->');

									Collapsible.Content($$renderer, {
										'data-testid': 'content',
										forceMount: true,
										child,
										$$slots: { child: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
						} else {
							$$renderer.push('<!--[-1-->');

							{
								function child($$renderer, { props, open: _open }) {
									$$renderer.push(`<div${$.attributes({ ...props })}>Content</div>`);
								}

								if (Collapsible.Content) {
									$$renderer.push('<!--[-->');

									Collapsible.Content($$renderer, {
										'data-testid': 'content',
										forceMount: true,
										child,
										$$slots: { child: true }
									});

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

		$$renderer.push(` <button data-testid="alt-trigger">Toggle</button></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}