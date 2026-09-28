import * as $ from 'svelte/internal/server';
import { Calendar, Segmented, Locale, Text } from "../../src/index";
import { en, cn, de, es, fr, it, ja, pt, ru } from "@svar-ui/core-locales";

export default function Locales($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let lang = "en";
		let numValue = 1256790.567;

		const options = [
			{ id: "en", label: "EN", locale: en },
			{ id: "cn", label: "CN", locale: cn },
			{ id: "de", label: "DE", locale: de },
			{ id: "es", label: "ES", locale: es },
			{ id: "fr", label: "FR", locale: fr },
			{ id: "it", label: "IT", locale: it },
			{ id: "ja", label: "JA", locale: ja },
			{ id: "pt", label: "PT", locale: pt },
			{ id: "ru", label: "RU", locale: ru }
		];

		function getWords(lang) {
			const op = options.find((op) => op.id == lang);

			return op?.locale || en;
		}

		function getFormattedNumber(l, n) {
			const locale = getWords(l);
			const localeName = locale.lang || "en-US";

			return new Intl.NumberFormat(localeName, { minimumFractionDigits: 2, style: "currency", currency: "EUR" }).format(n);
		}

		const value = new Date(2024, 2, 18);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo-box"><div class="demo-hscroll"><div>`);

			Segmented($$renderer, {
				options,
				get value() {
					return lang;
				},

				set value($$value) {
					lang = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div></div> <div class="demo-box" style="width: 300px"><!---->`);

			{
				Locale($$renderer, {
					words: getWords(lang),
					children: ($$renderer) => {
						$$renderer.push(`<div class="calendar svelte-6me0l2">`);
						Calendar($$renderer, { value });
						$$renderer.push(`<!----></div> <div class="bar svelte-6me0l2"><div class="text svelte-6me0l2">`);

						Text($$renderer, {
							get value() {
								return numValue;
							},

							set value($$value) {
								numValue = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div> ${$.escape(getFormattedNumber(lang, numValue))}</div>`);
					},
					$$slots: { default: true }
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