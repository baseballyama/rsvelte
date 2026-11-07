import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar, Segmented, Locale, Text } from "../../src/index";
import { en, cn, de, es, fr, it, ja, pt, ru } from "@svar-ui/core-locales";

var root = $.from_html(`<div class="calendar svelte-6me0l2"><!></div> <div class="bar svelte-6me0l2"><div class="text svelte-6me0l2"><!></div> </div>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><div class="demo-hscroll"><div><!></div></div></div> <div class="demo-box" style="width: 300px"><!></div>`, 1);

export default function Locales($$anchor, $$props) {
	$.push($$props, true);

	let lang = $.state("en");
	let numValue = $.state(1256790.567);

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
	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Segmented(node, {
		get options() {
			return options;
		},

		get value() {
			return $.get(lang);
		},

		set value($$value) {
			$.set(lang, $$value, true);
		}
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var node_1 = $.child(div_3);

	$.key(node_1, () => $.get(lang), ($$anchor) => {
		{
			let $0 = $.derived(() => getWords($.get(lang)));

			Locale($$anchor, {
				get words() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div_4 = $.first_child(fragment_2);
					var node_2 = $.child(div_4);

					Calendar(node_2, {
						get value() {
							return value;
						}
					});

					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var div_6 = $.child(div_5);
					var node_3 = $.child(div_6);

					Text(node_3, {
						get value() {
							return $.get(numValue);
						},

						set value($$value) {
							$.set(numValue, $$value, true);
						}
					});

					$.reset(div_6);

					var text = $.sibling(div_6);

					$.reset(div_5);
					$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => getFormattedNumber($.get(lang), $.get(numValue))]);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_3);
	$.append($$anchor, fragment);
	$.pop();
}