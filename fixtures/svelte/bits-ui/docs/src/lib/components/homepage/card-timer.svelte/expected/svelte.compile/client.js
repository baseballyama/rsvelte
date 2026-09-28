import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import X from "phosphor-svelte/lib/X";
import HomeSwitch from "$lib/components/homepage/home-switch.svelte";
import HomeSelect from "$lib/components/homepage/home-select.svelte";

var root = $.from_html(`<div class="data-active:text-foreground data-active:bg-white dark:data-active:text-[#171717] group flex select-none items-center rounded-[25px] bg-[#31343e] px-1 text-[8px] text-white/70 lg:px-2 lg:text-[11px] svelte-1y9bl0x"> <!></div>`);
var root_1 = $.from_html(`<div class="relative order-4 lg:order-5 lg:translate-y-[7%] svelte-1y9bl0x"><div class="line_top_gradient absolute left-8 top-0 hidden h-[1px] w-[calc(100%+50px)] lg:block svelte-1y9bl0x"></div> <div class="line_right_gradient absolute -top-[200px] bottom-0 right-0 hidden w-px rotate-180 lg:block svelte-1y9bl0x"></div> <div class="m-1.5 lg:m-[10px] svelte-1y9bl0x"><div class="rounded-card-lg border-border-input shadow-card aspect-square w-full border bg-white p-2 lg:px-[14px] lg:py-3 dark:bg-[#FAF8F5] svelte-1y9bl0x"><div class="rounded-15px bg-foreground mb-3 p-1 lg:mb-5 dark:bg-[#171717] svelte-1y9bl0x"><div class="rounded-xl bg-[rgba(81,84,95,0.6)] px-2 pb-7 pt-3 text-white lg:pb-8 svelte-1y9bl0x"><div class="text-[1.88519rem] font-medium leading-[100%] lg:text-[2.563rem] svelte-1y9bl0x"> </div> <div class="text-xxs font-medium lg:text-[13px] svelte-1y9bl0x">Task: <span class="relative ml-1 mr-1 mt-[2px] inline-flex h-[7px] w-[7px] lg:mr-2 lg:h-[10px] lg:w-[10px] svelte-1y9bl0x"><span></span> <span class="relative inline-flex h-[7px] w-[7px] rounded-full bg-rose-500 lg:h-[10px] lg:w-[10px] svelte-1y9bl0x"></span></span> <span class="capitalize svelte-1y9bl0x"> </span></div></div> <div class="labels mb-2 mt-[9px] flex gap-[3px] px-1 font-medium svelte-1y9bl0x"></div></div> <div class="flex gap-2 svelte-1y9bl0x"><!> <!></div></div></div></div>`);

export default function Card_timer($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.state(false);
	let startTime = $.state(0);
	let stopwatchInterval = null;
	let elapsedPausedTime = $.state(0);
	let displayTime = $.state("0:00:00");

	function startStopwatch() {
		if (stopwatchInterval !== null) return;

		$.set(startTime, new Date().getTime() - $.get(elapsedPausedTime));
		stopwatchInterval = window.setInterval(updateStopwatch, 1000);
	}

	function stopStopwatch() {
		if (stopwatchInterval !== null) {
			window.clearInterval(stopwatchInterval);
		}

		$.set(elapsedPausedTime, new Date().getTime() - $.get(startTime));
		stopwatchInterval = null;
	}

	function resetStopwatch() {
		stopStopwatch();
		$.set(elapsedPausedTime, 0);
		$.set(displayTime, "0:00:00");
	}

	function updateStopwatch() {
		const currentTime = new Date().getTime();
		const elapsedTime = currentTime - $.get(startTime);
		const seconds = Math.floor(elapsedTime / 1000) % 60;
		const minutes = Math.floor(elapsedTime / 1000 / 60) % 60;
		const hours = Math.floor(elapsedTime / 1000 / 60 / 60);

		$.set(displayTime, `${hours}:${pad(minutes)}:${pad(seconds)}`);
	}

	function pad(number) {
		return (number < 10 ? "0" : "") + number;
	}

	const chips = ["design", "code", "other"];
	let foo = $.state("new");
	var div = root_1();
	var div_1 = $.sibling($.child(div), 4);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var text = $.only_child(div_5, true);
	var div_6 = $.sibling(div_5, 2);
	var span = $.sibling($.child(div_6));
	var span_1 = $.child(span);

	$.next(2);
	$.reset(span);

	var span_2 = $.sibling(span, 2);
	var text_1 = $.only_child(span_2, true);

	$.reset(div_6);
	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);

	$.each(div_7, 21, () => chips, $.index, ($$anchor, chip, i) => {
		var div_8 = root();

		$.set_attribute(div_8, 'data-active', i === 0 ? "" : undefined);

		var text_2 = $.child(div_8);
		var node = $.sibling(text_2);

		X(node, {
			class: 'group-data-active:block relative ml-1.5 hidden size-1.5',
			weight: 'bold',
			'aria-label': 'Close'
		});

		$.reset(div_8);
		$.template_effect(() => $.set_text(text_2, `${$.get(chip) ?? ''} `));
		$.append($$anchor, div_8);
	});

	$.reset(div_7);
	$.reset(div_3);

	var div_9 = $.sibling(div_3, 2);
	var node_1 = $.child(div_9);

	HomeSelect(node_1, {
		get value() {
			return $.get(foo);
		},

		set value($$value) {
			$.set(foo, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	HomeSwitch(node_2, {
		onCheckedChange: (c) => {
			if (c) {
				startStopwatch();
			} else {
				resetStopwatch();
			}
		},

		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	$.reset(div_9);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $.get(displayTime));
		$.set_class(span_1, 1, `${$.get(checked) ? 'ping_anim' : ''} absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75`, 'svelte-1y9bl0x');
		$.set_text(text_1, $.get(foo));
	});

	$.append($$anchor, div);
	$.pop();
}