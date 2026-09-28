import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ThemeSwitcher from "$lib/components/examples/command/theme-switcher.svelte";
import CommandWrapper from "$lib/components/examples/command/command-wrapper.svelte";
import RaycastCommand from "$lib/components/examples/command/raycast/raycast-command.svelte";
import LinearCommand from "$lib/components/examples/command/linear/linear-command.svelte";
import VercelCommand from "$lib/components/examples/command/vercel/vercel-command.svelte";
import FramerCommand from "$lib/components/examples/command/framer/framer-command.svelte";

var root = $.from_html(`<main class="main"><div class="content"><div><!></div> <!> <div aria-hidden="true" class="line"></div></div></main>`);

export default function _page($$anchor) {
	let theme = $.state("raycast");
	var main = root();
	var div = $.child(main);
	var div_1 = $.child(div);

	$.set_style(div_1, '', {}, { height: '475px' });

	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			CommandWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					RaycastCommand($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		var consequent_1 = ($$anchor) => {
			CommandWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					LinearCommand($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		var consequent_2 = ($$anchor) => {
			CommandWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					VercelCommand($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		var consequent_3 = ($$anchor) => {
			CommandWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					FramerCommand($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(theme) === "raycast") $$render(consequent); else if ($.get(theme) === "linear") $$render(consequent_1, 1); else if ($.get(theme) === "vercel") $$render(consequent_2, 2); else if ($.get(theme) === "framer") $$render(consequent_3, 3);
		});
	}

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	ThemeSwitcher(node_1, {
		get theme() {
			return $.get(theme);
		},

		set theme($$value) {
			$.set(theme, $$value, true);
		}
	});

	$.next(2);
	$.reset(div);
	$.reset(main);
	$.append($$anchor, main);
}