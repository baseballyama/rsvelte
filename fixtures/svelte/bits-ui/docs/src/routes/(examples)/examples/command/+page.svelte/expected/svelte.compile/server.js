import * as $ from 'svelte/internal/server';
import ThemeSwitcher from "$lib/components/examples/command/theme-switcher.svelte";
import CommandWrapper from "$lib/components/examples/command/command-wrapper.svelte";
import RaycastCommand from "$lib/components/examples/command/raycast/raycast-command.svelte";
import LinearCommand from "$lib/components/examples/command/linear/linear-command.svelte";
import VercelCommand from "$lib/components/examples/command/vercel/vercel-command.svelte";
import FramerCommand from "$lib/components/examples/command/framer/framer-command.svelte";

export default function _page($$renderer) {
	let theme = "raycast";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main class="main"><div class="content"><div${$.attr_style('', { height: '475px' })}>`);

		if (theme === "raycast") {
			$$renderer.push('<!--[0-->');

			CommandWrapper($$renderer, {
				children: ($$renderer) => {
					RaycastCommand($$renderer, {});
				},
				$$slots: { default: true }
			});
		} else if (theme === "linear") {
			$$renderer.push('<!--[1-->');

			CommandWrapper($$renderer, {
				children: ($$renderer) => {
					LinearCommand($$renderer, {});
				},
				$$slots: { default: true }
			});
		} else if (theme === "vercel") {
			$$renderer.push('<!--[2-->');

			CommandWrapper($$renderer, {
				children: ($$renderer) => {
					VercelCommand($$renderer, {});
				},
				$$slots: { default: true }
			});
		} else if (theme === "framer") {
			$$renderer.push('<!--[3-->');

			CommandWrapper($$renderer, {
				children: ($$renderer) => {
					FramerCommand($$renderer, {});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		ThemeSwitcher($$renderer, {
			get theme() {
				return theme;
			},

			set theme($$value) {
				theme = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div aria-hidden="true" class="line"></div></div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}