import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<div class="demo-strip svelte-1wycr3j"><div class="demo-head svelte-1wycr3j"><div><span class="demo-dot svelte-1wycr3j" aria-hidden="true"></span> <span class="demo-label svelte-1wycr3j"> </span></div> <div class="demo-uptime svelte-1wycr3j"><span class="demo-uptime-value svelte-1wycr3j"> </span> <span class="demo-uptime-meta svelte-1wycr3j">uptime</span></div></div> <div class="demo-bar svelte-1wycr3j" aria-hidden="true"></div> <div class="demo-meta svelte-1wycr3j" aria-hidden="true"><span class="svelte-1wycr3j">demo monitor &middot; HTTP</span> <span class="svelte-1wycr3j"></span></div> <p class="sr-only svelte-1wycr3j">Demo of a Kener monitor: a rolling uptime bar that records a check every second.</p></div>`);

export default function LandingStatusDemo($$anchor, $$props) {
	$.push($$props, true);

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

	let ticks = $.state($.proxy(seedTicks()));
	let clock = $.state(0);
	const isDegraded = $.derived(() => $.get(ticks)[$.get(ticks).length - 1]?.status === "degraded");
	const uptime = $.derived(() => ($.get(ticks).reduce((sum, t) => sum + (t.status === "up" ? 100 : DEGRADED_VALUE), 0) / $.get(ticks).length).toFixed(3));

	onMount(() => {
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

		if (reduceMotion.matches) return; // static seeded bar, no live march

		let timer;

		const tick = () => {
			$.set(clock, $.get(clock) + 1);

			const phase = $.get(clock) % CYCLE;
			const status = phase === DIP_AT || phase === DIP_AT + 1 ? "degraded" : "up";

			$.set(ticks, [...$.get(ticks).slice(1), { id: nextId++, status }], true);
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
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	let classes;
	var span = $.sibling($.child(div_2), 2);
	var text = $.only_child(span, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var span_1 = $.child(div_3);
	var text_1 = $.only_child(span_1);

	$.next(2);
	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);

	$.each(div_4, 21, () => $.get(ticks), (tick) => tick.id, ($$anchor, tick) => {
		var span_2 = root();
		let classes_1;

		$.template_effect(() => classes_1 = $.set_class(span_2, 1, 'demo-tick svelte-1wycr3j', null, classes_1, { degraded: $.get(tick).status === "degraded" }));
		$.append($$anchor, span_2);
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var span_3 = $.sibling($.child(div_5), 2);

	span_3.textContent = 'last 64 checks';
	$.reset(div_5);
	$.next(2);
	$.reset(div);
	$.bind_this(div, ($$value) => strip = $$value, () => strip);

	$.template_effect(() => {
		classes = $.set_class(div_2, 1, 'demo-state svelte-1wycr3j', null, classes, { degraded: $.get(isDegraded) });
		$.set_text(text, $.get(isDegraded) ? "Degraded performance" : "All systems operational");
		$.set_text(text_1, `${$.get(uptime) ?? ''}%`);
	});

	$.append($$anchor, div);
	$.pop();
}