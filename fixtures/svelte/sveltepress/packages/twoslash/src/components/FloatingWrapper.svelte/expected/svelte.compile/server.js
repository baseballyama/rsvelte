import * as $ from 'svelte/internal/server';

export default function FloatingWrapper($$renderer, $$props) {
	const { children, floatingContent, $$slots, $$events, ...rest } = $$props;

	$.await($$renderer, import('./Floating.svelte'), () => {}, ({ default: Comp }) => {
		{
			function content($$renderer) {
				floatingContent?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			if (Comp) {
				$$renderer.push('<!--[-->');

				Comp($$renderer, $.spread_props([
					rest,
					{
						content,
						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { content: true, default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	});

	$$renderer.push(`<!--]-->`);
}