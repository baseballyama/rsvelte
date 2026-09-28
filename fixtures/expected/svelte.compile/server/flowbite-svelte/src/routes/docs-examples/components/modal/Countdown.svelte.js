import * as $ from 'svelte/internal/server';
import { Button, Modal, P, A } from "flowbite-svelte";
import { createCountdown } from "$utils/countdown.svelte.ts";

export default function Countdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const adCountdown = createCountdown(4);
		const termsCountdown = createCountdown(5);
		let adModal = false;
		let termsModal = false;

		function countdownText(remaining) {
			return `Close available in ${remaining}s`;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			Button($$renderer, {
				class: 'w-40',
				onclick: () => adModal = true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show Ad Modal`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<div class="flex w-full items-center justify-between"><h2>Ad: Special Offer!</h2> `);

					if (adCountdown.isRunning) {
						$$renderer.push(`<!--[0--><span class="text-sm text-gray-500 dark:text-gray-400">${$.escape(countdownText(adCountdown.timeLeft))}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				Modal($$renderer, {
					permanent: adCountdown.isRunning,
					dismissable: !adCountdown.isRunning,
					outsideclose: !adCountdown.isRunning,
					get open() {
						return adModal;
					},

					set open($$value) {
						adModal = $$value;
						$$settled = false;
					},
					header,
					children: ($$renderer) => {
						$$renderer.push(`<div class="text-center">`);

						P($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->🎉 Get 50% off your next purchase!`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						P($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->This amazing deal won't last long. Sign up now to claim your discount.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			A($$renderer, {
				onclick: () => termsModal = true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Terms of Service`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<div class="flex w-full items-center justify-between"><h3>Terms of Service</h3> `);

					if (termsCountdown.isRunning) {
						$$renderer.push(`<!--[0--><span class="text-sm text-gray-500 dark:text-gray-400">${$.escape(countdownText(termsCountdown.timeLeft))}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				function footer($$renderer) {
					Button($$renderer, {
						value: 'success',
						onclick: () => alert("Clicked type is button"),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Button won't close the modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'submit',
						value: 'decline',
						color: 'alternative',
						children: ($$renderer) => {
							$$renderer.push(`<!---->type submit close the modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Modal($$renderer, {
					form: true,
					permanent: termsCountdown.isRunning,
					dismissable: !termsCountdown.isRunning,
					outsideclose: !termsCountdown.isRunning,
					get open() {
						return termsModal;
					},

					set open($$value) {
						termsModal = $$value;
						$$settled = false;
					},
					header,
					footer,
					children: ($$renderer) => {
						P($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						P($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The European Union's General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { header: true, footer: true, default: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}