import * as $ from 'svelte/internal/server';
import { FiniteStateMachine } from "runed";
import { DemoContainer, Button, Switch } from "@svecodocs/kit";
import Play from "phosphor-svelte/lib/Play";
import Pause from "phosphor-svelte/lib/Pause";

export default function Finite_state_machine($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-4',
			children: ($$renderer) => {
				$$renderer.push(`<h1 class="text-xl font-bold svelte-1c8hzjv">Now: <code class="svelte-1c8hzjv">${$.escape(f.current)}</code></h1> <p class="svelte-1c8hzjv">${$.escape(descriptionText())}</p> <div class="flex items-center gap-4 svelte-1c8hzjv">`);

				Switch($$renderer, {
					class: 'mt-0.5',
					checked: f.current !== "disabled",
					onCheckedChange: () => f.send("toggleEnabled")
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'brand',
					size: 'sm',
					disabled: f.current === "disabled",
					onclick: () => f.current === "running" ? f.send("stop") : f.send("start"),
					class: 'gap-2',
					children: ($$renderer) => {
						if (f.current === "running") {
							$$renderer.push('<!--[0-->');
							Pause($$renderer, { size: 16, weight: 'fill' });
							$$renderer.push(`<!----> Stop`);
						} else {
							$$renderer.push('<!--[-1-->');
							Play($$renderer, { size: 16, weight: 'fill' });
							$$renderer.push(`<!----> Run`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (f.current === "running") {
					$$renderer.push(`<!--[0--><div class="bg-muted relative h-6 w-40 overflow-clip rounded-md svelte-1c8hzjv"><div class="progress bg-brand absolute h-full w-full svelte-1c8hzjv"></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}