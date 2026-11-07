import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import { mode, toggleMode } from "mode-watcher";

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-[1.2rem] w-[1.2rem]"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-[1.2rem] w-[1.2rem]"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`);
var root_2 = $.from_html(`<!> <span class="sr-only">Toggle theme</span>`, 1);

export default function ThemeToggle($$anchor, $$props) {
	$.push($$props, true);

	Button($$anchor, {
		get onclick() {
			return toggleMode;
		},
		class: 'cursor-pointer rounded-full',
		variant: 'ghost',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var svg = root();

					$.append($$anchor, svg);
				};

				var alternate = ($$anchor) => {
					var svg_1 = root_1();

					$.append($$anchor, svg_1);
				};

				$.if(node, ($$render) => {
					if (mode.current === "light") $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}