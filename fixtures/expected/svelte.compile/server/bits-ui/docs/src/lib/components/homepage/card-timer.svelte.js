import * as $ from 'svelte/internal/server';
import X from "phosphor-svelte/lib/X";
import HomeSwitch from "$lib/components/homepage/home-switch.svelte";
import HomeSelect from "$lib/components/homepage/home-select.svelte";

export default function Card_timer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let checked = false;
		let startTime = 0;
		let stopwatchInterval = null;
		let elapsedPausedTime = 0;
		let displayTime = "0:00:00";

		function startStopwatch() {
			if (stopwatchInterval !== null) return;

			startTime = new Date().getTime() - elapsedPausedTime;
			stopwatchInterval = window.setInterval(updateStopwatch, 1000);
		}

		function stopStopwatch() {
			if (stopwatchInterval !== null) {
				window.clearInterval(stopwatchInterval);
			}

			elapsedPausedTime = new Date().getTime() - startTime;
			stopwatchInterval = null;
		}

		function resetStopwatch() {
			stopStopwatch();
			elapsedPausedTime = 0;
			displayTime = "0:00:00";
		}

		function updateStopwatch() {
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - startTime;
			const seconds = Math.floor(elapsedTime / 1000) % 60;
			const minutes = Math.floor(elapsedTime / 1000 / 60) % 60;
			const hours = Math.floor(elapsedTime / 1000 / 60 / 60);

			displayTime = `${hours}:${pad(minutes)}:${pad(seconds)}`;
		}

		function pad(number) {
			return (number < 10 ? "0" : "") + number;
		}

		const chips = ["design", "code", "other"];
		let foo = "new";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="relative order-4 lg:order-5 lg:translate-y-[7%] svelte-1y9bl0x"><div class="line_top_gradient absolute left-8 top-0 hidden h-[1px] w-[calc(100%+50px)] lg:block svelte-1y9bl0x"></div> <div class="line_right_gradient absolute -top-[200px] bottom-0 right-0 hidden w-px rotate-180 lg:block svelte-1y9bl0x"></div> <div class="m-1.5 lg:m-[10px] svelte-1y9bl0x"><div class="rounded-card-lg border-border-input shadow-card aspect-square w-full border bg-white p-2 lg:px-[14px] lg:py-3 dark:bg-[#FAF8F5] svelte-1y9bl0x"><div class="rounded-15px bg-foreground mb-3 p-1 lg:mb-5 dark:bg-[#171717] svelte-1y9bl0x"><div class="rounded-xl bg-[rgba(81,84,95,0.6)] px-2 pb-7 pt-3 text-white lg:pb-8 svelte-1y9bl0x"><div class="text-[1.88519rem] font-medium leading-[100%] lg:text-[2.563rem] svelte-1y9bl0x">${$.escape(displayTime)}</div> <div class="text-xxs font-medium lg:text-[13px] svelte-1y9bl0x">Task: <span class="relative ml-1 mr-1 mt-[2px] inline-flex h-[7px] w-[7px] lg:mr-2 lg:h-[10px] lg:w-[10px] svelte-1y9bl0x"><span${$.attr_class(`${checked ? 'ping_anim' : ''} absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75`, 'svelte-1y9bl0x')}></span> <span class="relative inline-flex h-[7px] w-[7px] rounded-full bg-rose-500 lg:h-[10px] lg:w-[10px] svelte-1y9bl0x"></span></span> <span class="capitalize svelte-1y9bl0x">${$.escape(foo)}</span></div></div> <div class="labels mb-2 mt-[9px] flex gap-[3px] px-1 font-medium svelte-1y9bl0x"><!--[-->`);

			const each_array = $.ensure_array_like(chips);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let chip = each_array[i];

				$$renderer.push(`<div${$.attr('data-active', i === 0 ? "" : undefined)} class="data-active:text-foreground data-active:bg-white dark:data-active:text-[#171717] group flex select-none items-center rounded-[25px] bg-[#31343e] px-1 text-[8px] text-white/70 lg:px-2 lg:text-[11px] svelte-1y9bl0x">${$.escape(chip)} `);

				X($$renderer, {
					class: 'group-data-active:block relative ml-1.5 hidden size-1.5',
					weight: 'bold',
					'aria-label': 'Close'
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="flex gap-2 svelte-1y9bl0x">`);

			HomeSelect($$renderer, {
				get value() {
					return foo;
				},

				set value($$value) {
					foo = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			HomeSwitch($$renderer, {
				onCheckedChange: (c) => {
					if (c) {
						startStopwatch();
					} else {
						resetStopwatch();
					}
				},

				get checked() {
					return checked;
				},

				set checked($$value) {
					checked = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}