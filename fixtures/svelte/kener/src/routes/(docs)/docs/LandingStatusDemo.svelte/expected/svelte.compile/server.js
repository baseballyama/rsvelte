import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";

export default function LandingStatusDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const WINDOW = 64;

		/** A degraded check still serves most requests; mirrors how Kener scores a degraded bucket. */
		const DEGRADED_VALUE = 97;

		/** Every CYCLE seconds the demo dips for two ticks, then recovers. */
		const CYCLE = 22;

		const DIP_AT = 14;
		let nextId = 0;

		function seedTicks() {
			// Seed with one healed dip mid-history so the bar tells its story at first paint.
			return Array.from({ length: WINDOW }, (_, i) => ({
				id: nextId++,
				status: i === 22 || i === 23 ? "degraded" : "up"
			}));
		}

		let ticks = seedTicks();
		let clock = 0;
		const isDegraded = $.derived(() => ticks[ticks.length - 1]?.status === "degraded");
		const uptime = $.derived(() => (ticks.reduce((sum, t) => sum + (t.status === "up" ? 100 : DEGRADED_VALUE), 0) / ticks.length).toFixed(3));

		onMount(() => {
			const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

			if (reduceMotion.matches) return; // static seeded bar, no live march

			let timer;

			const tick = () => {
				clock += 1;

				const phase = clock % CYCLE;
				const status = phase === DIP_AT || phase === DIP_AT + 1 ? "degraded" : "up";

				ticks = [...ticks.slice(1), { id: nextId++, status }];
			};

			const start = () => {
				if (timer === undefined) timer = setInterval(tick, 1000);
			};

			const stop = () => {
				if (timer !== undefined) {
					clearInterval(timer);
					timer = undefined;
				}
			};

			// Run only while visible: on-screen and tab focused.
			const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && !document.hidden ? start() : stop(), { threshold: 0.1 });

			observer.observe(strip);

			const onVisibility = () => document.hidden ? stop() : start();

			document.addEventListener("visibilitychange", onVisibility);

			return () => {
				stop();
				observer.disconnect();
				document.removeEventListener("visibilitychange", onVisibility);
			};
		});

		let strip;

		$$renderer.push(`<div class="demo-strip svelte-1wycr3j"><div class="demo-head svelte-1wycr3j"><div${$.attr_class('demo-state svelte-1wycr3j', void 0, { 'degraded': isDegraded() })}><span class="demo-dot svelte-1wycr3j" aria-hidden="true"></span> <span class="demo-label svelte-1wycr3j">${$.escape(isDegraded() ? "Degraded performance" : "All systems operational")}</span></div> <div class="demo-uptime svelte-1wycr3j"><span class="demo-uptime-value svelte-1wycr3j">${$.escape(uptime())}%</span> <span class="demo-uptime-meta svelte-1wycr3j">uptime</span></div></div> <div class="demo-bar svelte-1wycr3j" aria-hidden="true"><!--[-->`);

		const each_array = $.ensure_array_like(ticks);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tick = each_array[$$index];

			$$renderer.push(`<span${$.attr_class('demo-tick svelte-1wycr3j', void 0, { 'degraded': tick.status === "degraded" })}></span>`);
		}

		$$renderer.push(`<!--]--></div> <div class="demo-meta svelte-1wycr3j" aria-hidden="true"><span class="svelte-1wycr3j">demo monitor · HTTP</span> <span class="svelte-1wycr3j">last 64 checks</span></div> <p class="sr-only svelte-1wycr3j">Demo of a Kener monitor: a rolling uptime bar that records a check every second.</p></div>`);
	});
}