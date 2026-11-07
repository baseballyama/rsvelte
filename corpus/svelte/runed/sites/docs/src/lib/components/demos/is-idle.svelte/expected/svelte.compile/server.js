import * as $ from 'svelte/internal/server';
import { AnimationFrames, IsIdle } from "runed";
import { DemoContainer } from "@svecodocs/kit";
import DemoNote from "../demo-note.svelte";

export default function Is_idle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const idle = new IsIdle({ timeout: 1000 });
		let now = Date.now();

		new AnimationFrames(() => {
			now = Date.now();
		});

		const secondsElapsed = $.derived(() => Math.floor((now - idle.lastActive) / 1000));

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-3',
			children: ($$renderer) => {
				$$renderer.push(`<p>Idle: <span${$.attr_class(`font-medium ${idle.current
					? 'text-green-600 dark:text-green-500'
					: 'text-destructive'}`)}>${$.escape(idle.current)}</span></p> <p>Last active: <span class="font-medium">${$.escape(secondsElapsed())}s ago</span></p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DemoNote($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>By default, the time of inactivity before marking the user as idle is 1 minute.</p> <p>In this demo, it's 1 second.</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}