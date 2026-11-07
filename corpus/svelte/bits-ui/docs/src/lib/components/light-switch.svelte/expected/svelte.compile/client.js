import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "bits-ui";
import { mode, toggleMode } from "mode-watcher";
import { scale } from "svelte/transition";
import { cubicOut } from "svelte/easing";
import Moon from "phosphor-svelte/lib/Moon";
import Sun from "phosphor-svelte/lib/Sun";

var root = $.from_html(`<div class="absolute inline-flex h-full w-full items-center justify-center"><!></div>`);

export default function Light_switch($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => mode.current === "light");
		let $1 = $.derived(() => mode.current === 'dark' ? 'Dark' : 'Light');

		$.component(node, () => Button.Root, ($$anchor, Button_Root) => {
			Button_Root($$anchor, {
				get onclick() {
					return toggleMode;
				},
				role: 'switch',
				'aria-label': 'Light Switch',
				get 'aria-checked'() {
					return $.get($0);
				},

				get title() {
					return `Toggle ${$.get($1) ?? ''} Mode`;
				},
				class: 'rounded-input hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex h-10 w-10 cursor-pointer items-center justify-center px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var div = root();
							var node_2 = $.child(div);

							Moon(node_2, { class: 'size-6', 'aria-label': 'Moon' });
							$.reset(div);
							$.transition(3, div, () => scale, () => ({ delay: 50, duration: 200, start: 0.7, easing: cubicOut }));
							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var div_1 = root();
							var node_3 = $.child(div_1);

							Sun(node_3, { class: 'size-6', 'aria-label': 'Sun' });
							$.reset(div_1);
							$.transition(3, div_1, () => scale, () => ({ delay: 50, duration: 200, start: 0.7, easing: cubicOut }));
							$.append($$anchor, div_1);
						};

						$.if(node_1, ($$render) => {
							if (mode.current === "light") $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}