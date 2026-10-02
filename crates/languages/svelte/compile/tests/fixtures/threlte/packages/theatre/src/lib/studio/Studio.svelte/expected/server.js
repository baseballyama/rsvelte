import * as $ from 'svelte/internal/server';

export default function Studio($$renderer, $$props) {
	let { enabled = true, hide = false, children } = $$props;
	const browser = typeof window !== 'undefined';

	if (browser && enabled) {
		$$renderer.push('<!--[0-->');

		$.await($$renderer, import('./InnerStudio.svelte'), () => {}, (Component) => {
			if (Component.default) {
				$$renderer.push('<!--[-->');

				Component.default($$renderer, {
					hide,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);
}