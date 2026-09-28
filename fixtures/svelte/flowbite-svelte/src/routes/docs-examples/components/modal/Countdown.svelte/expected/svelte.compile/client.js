import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P, A } from "flowbite-svelte";
import { createCountdown } from "$utils/countdown.svelte.ts";

var root = $.from_html(`<span class="text-sm text-gray-500 dark:text-gray-400"> </span>`);
var root_1 = $.from_html(`<div class="flex w-full items-center justify-between"><h2>Ad: Special Offer!</h2> <!></div>`);
var root_2 = $.from_html(`<div class="text-center"><!> <!></div>`);
var root_3 = $.from_html(`<div class="flex w-full items-center justify-between"><h3>Terms of Service</h3> <!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex flex-col gap-4"><!> <!> <!> <!></div>`);

export default function Countdown($$anchor, $$props) {
	$.push($$props, true);

	const adCountdown = createCountdown(4);
	const termsCountdown = createCountdown(5);
	let adModal = $.state(false);
	let termsModal = $.state(false);

	function countdownText(remaining) {
		return `Close available in ${remaining}s`;
	}

	$.user_effect(() => {
		if ($.get(adModal)) adCountdown.start(); else adCountdown.reset(4);
		if ($.get(termsModal)) termsCountdown.start(); else termsCountdown.reset(5);
	});

	var div = root_5();
	var node = $.child(div);

	Button(node, {
		class: 'w-40',
		onclick: () => $.set(adModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show Ad Modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const header = ($$anchor) => {
			var div_1 = root_1();
			var node_2 = $.sibling($.child(div_1), 2);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text_1 = $.only_child(span, true);

					$.template_effect(($0) => $.set_text(text_1, $0), [() => countdownText(adCountdown.timeLeft)]);
					$.append($$anchor, span);
				};

				$.if(node_2, ($$render) => {
					if (adCountdown.isRunning) $$render(consequent);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		let $0 = $.derived(() => !adCountdown.isRunning);
		let $1 = $.derived(() => !adCountdown.isRunning);

		Modal(node_1, {
			get permanent() {
				return adCountdown.isRunning;
			},

			get dismissable() {
				return $.get($0);
			},

			get outsideclose() {
				return $.get($1);
			},

			get open() {
				return $.get(adModal);
			},

			set open($$value) {
				$.set(adModal, $$value, true);
			},
			header,
			children: ($$anchor, $$slotProps) => {
				var div_2 = root_2();
				var node_3 = $.child(div_2);

				P(node_3, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('🎉 Get 50% off your next purchase!');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				P(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('This amazing deal won\'t last long. Sign up now to claim your discount.');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			},
			$$slots: { header: true, default: true }
		});
	}

	var node_5 = $.sibling(node_1, 2);

	A(node_5, {
		onclick: () => $.set(termsModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Terms of Service');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	{
		const header = ($$anchor) => {
			var div_3 = root_3();
			var node_7 = $.sibling($.child(div_3), 2);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root();
					var text_5 = $.only_child(span_1, true);

					$.template_effect(($0) => $.set_text(text_5, $0), [() => countdownText(termsCountdown.timeLeft)]);
					$.append($$anchor, span_1);
				};

				$.if(node_7, ($$render) => {
					if (termsCountdown.isRunning) $$render(consequent_1);
				});
			}

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		const footer = ($$anchor) => {
			var fragment = root_4();
			var node_8 = $.first_child(fragment);

			Button(node_8, {
				value: 'success',
				onclick: () => alert("Clicked type is button"),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Button won\'t close the modal');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				type: 'submit',
				value: 'decline',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('type submit close the modal');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		let $0 = $.derived(() => !termsCountdown.isRunning);
		let $1 = $.derived(() => !termsCountdown.isRunning);

		Modal(node_6, {
			form: true,
			get permanent() {
				return termsCountdown.isRunning;
			},

			get dismissable() {
				return $.get($0);
			},

			get outsideclose() {
				return $.get($1);
			},

			get open() {
				return $.get(termsModal);
			},

			set open($$value) {
				$.set(termsModal, $$value, true);
			},
			header,
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_10 = $.first_child(fragment_1);

				P(node_10, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				P(node_11, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('The European Union\'s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union.');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { header: true, footer: true, default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}