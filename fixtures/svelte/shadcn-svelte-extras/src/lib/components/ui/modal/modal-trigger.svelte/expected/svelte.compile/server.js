import * as $ from 'svelte/internal/server';
import { useModalSub } from './modal.svelte.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';

export default function Modal_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const modal = useModalSub();
		let { ref = null, children, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (modal.view === 'desktop') {
				$$renderer.push('<!--[0-->');

				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, $.spread_props([
						rest,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
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

				if (Drawer.Trigger) {
					$$renderer.push('<!--[-->');

					Drawer.Trigger($$renderer, $.spread_props([
						rest,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
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
		$.bind_props($$props, { ref });
	});
}