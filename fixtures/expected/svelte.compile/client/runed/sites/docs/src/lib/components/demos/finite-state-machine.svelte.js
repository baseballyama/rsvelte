import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FiniteStateMachine } from "runed";
import { DemoContainer, Button, Switch } from "@svecodocs/kit";
import Play from "phosphor-svelte/lib/Play";
import Pause from "phosphor-svelte/lib/Pause";

var root = $.from_html(`<!> Stop`, 1);
var root_1 = $.from_html(`<!> Run`, 1);
var root_2 = $.from_html(`<div class="bg-muted relative h-6 w-40 overflow-clip rounded-md svelte-1c8hzjv"><div class="progress bg-brand absolute h-full w-full svelte-1c8hzjv"></div></div>`);
var root_3 = $.from_html(`<h1 class="text-xl font-bold svelte-1c8hzjv">Now: <code class="svelte-1c8hzjv"> </code></h1> <p class="svelte-1c8hzjv"> </p> <div class="flex items-center gap-4 svelte-1c8hzjv"><!> <!> <!></div>`, 1);

export default function Finite_state_machine($$anchor, $$props) {
	$.push($$props, true);

	const f = new FiniteStateMachine("disabled", {
		disabled: { toggleEnabled: "idle" },
		idle: { toggleEnabled: "disabled", start: "running" },
		running: {
			_enter: () => {
				f.debounce(2000, "stop");
			},
			stop: "idle",
			toggleEnabled: "disabled"
		}
	});

	const descriptionText = $.derived(() => {
		switch (f.current) {
			case "disabled":
				return "Toggle the switch to enable.";

			case "idle":
				return "Click the Run button to run for two seconds.";

			case "running":
				return "Running for two seconds. Click the Stop button or toggle the switch.";
		}
	});

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var h1 = $.first_child(fragment_1);
			var code = $.sibling($.child(h1));
			var text = $.only_child(code, true);

			$.reset(h1);

			var p = $.sibling(h1, 2);
			var text_1 = $.only_child(p, true);
			var div = $.sibling(p, 2);
			var node = $.child(div);

			{
				let $0 = $.derived(() => f.current !== "disabled");

				Switch(node, {
					class: 'mt-0.5',
					get checked() {
						return $.get($0);
					},
					onCheckedChange: () => f.send("toggleEnabled")
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => f.current === "disabled");

				Button(node_1, {
					variant: 'brand',
					size: 'sm',
					get disabled() {
						return $.get($0);
					},
					onclick: () => f.current === "running" ? f.send("stop") : f.send("start"),
					class: 'gap-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								Pause(node_3, { size: 16, weight: 'fill' });
								$.next();
								$.append($$anchor, fragment_3);
							};

							var alternate = ($$anchor) => {
								var fragment_4 = root_1();
								var node_4 = $.first_child(fragment_4);

								Play(node_4, { size: 16, weight: 'fill' });
								$.next();
								$.append($$anchor, fragment_4);
							};

							$.if(node_2, ($$render) => {
								if (f.current === "running") $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}

			var node_5 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_1 = root_2();

					$.append($$anchor, div_1);
				};

				$.if(node_5, ($$render) => {
					if (f.current === "running") $$render(consequent_1);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, f.current);
				$.set_text(text_1, $.get(descriptionText));
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}