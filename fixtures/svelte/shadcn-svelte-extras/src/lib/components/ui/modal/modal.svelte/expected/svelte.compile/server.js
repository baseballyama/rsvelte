import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import { useModal } from './modal.svelte.js';

export default function Modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, children, $$slots, $$events, ...rest } = $$props;
		const modal = useModal();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (modal.view === 'desktop') {
				$$renderer.push('<!--[0-->');

				if (Dialog.Root) {
					$$renderer.push('<!--[-->');

					Dialog.Root($$renderer, $.spread_props([
						rest,
						{
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								children?.($$renderer);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');

				if (Drawer.Root) {
					$$renderer.push('<!--[-->');

					Drawer.Root($$renderer, $.spread_props([
						rest,
						{
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								children?.($$renderer);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}