import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { useRenameSave } from './rename.svelte.js';

export default function Rename_save($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const saveState = useRenameSave();

		let {
			ref = null,
			children,
			variant = 'default',
			child,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (child) {
				$$renderer.push('<!--[0-->');
				child($$renderer, { save: saveState.save });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				Button($$renderer, $.spread_props([
					{ type: 'button', onclick: saveState.save, variant },
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
							if (children) {
								$$renderer.push('<!--[0-->');
								children($$renderer);
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push(`<!--[-1-->Save`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));
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