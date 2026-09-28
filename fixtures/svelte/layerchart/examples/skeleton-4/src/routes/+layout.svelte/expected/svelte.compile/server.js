import * as $ from 'svelte/internal/server';
import { Switch } from '@skeletonlabs/skeleton-svelte';
import { ModeWatcher, mode, setMode } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$.head('sznme2', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
		});

		ModeWatcher($$renderer, { defaultTheme: 'cerberus' });
		$$renderer.push(`<!----> <main class="p-4"><div class="pb-4 text-right">`);

		Switch($$renderer, {
			checked: mode.current === 'dark',
			onCheckedChange: (e) => setMode(e.checked ? 'dark' : 'light'),
			children: ($$renderer) => {
				if (Switch.Control) {
					$$renderer.push('<!--[-->');

					Switch.Control($$renderer, {
						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');
								Switch.Thumb($$renderer, {});
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

				$$renderer.push(` `);

				if (Switch.HiddenInput) {
					$$renderer.push('<!--[-->');
					Switch.HiddenInput($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}