import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { connection, lang, motion, selectedLanguage, ripple } from '$lib/Stores';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import Ripple from 'svelte-ripple';

var root = $.from_html(`<span>...</span>`);
var root_1 = $.from_html(`<span> </span> <span> </span>`, 1);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<button class="button"><figure><!></figure> </button> <div class="response svelte-10agxu6"><!></div>`, 1);

export default function SayButton($$anchor, $$props) {
	$.push($$props, true);

	const $selectedLanguage = () => $.store_get(selectedLanguage, '$selectedLanguage', $$stores);
	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const $motion = () => $.store_get(motion, '$motion', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * BETA: Rewrite component!
	 */
	let recognizing;

	let speech;
	let interim = '';
	let final = '';
	let response;

	async function processConversation(input) {
		connection.subscribe(async (conn) => {
			try {
				if (conn?.sendMessagePromise) {
					const res = await conn.sendMessagePromise({
						type: 'conversation/process',
						text: input,
						language: $selectedLanguage()
					});

					response = res?.response?.speech?.plain?.speech;

					setTimeout(
						() => {
							final = '';
							interim = '';
							response = undefined;
						},
						2000
					);
				}
			} catch(error) {
				console.error('Error:', error);
			}
		});
	}

	onMount(() => {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		if (SpeechRecognition) {
			speech = new SpeechRecognition();
			speech.continuous = true;
			speech.interimResults = true;
			speech.lang = $selectedLanguage();

			speech.onstart = () => {
				recognizing = true;
			};

			speech.onresult = (event) => {
				interim = '';

				for (let i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						final += event.results[i][0].transcript;
					} else {
						interim += event.results[i][0].transcript;
					}
				}
			};

			speech.onend = () => {
				recognizing = false;
			};

			speech.onerror = (event) => {
				console.error('Error in speech recognition:', event.error);
			};
		} else {
			console.error('Speech recognition not supported in this browser.');
		}
	});

	function startRecognition() {
		// isPressed = true;
		final = '';

		interim = '';
		response = undefined;

		if (!recognizing) {
			speech.start();
		}
	}

	async function stopRecognition() {
		// isPressed = false;
		if (recognizing) {
			setTimeout(
				async () => {
					speech.stop();

					let iterations = 0;

					while (final === '' && iterations < 10) {
						await new Promise((resolve) => setTimeout(resolve, 100));
						iterations++;
					}

					if (final !== '') {
						processConversation(final);
					}
				},
				1000
			);
		}
	}

	var fragment = root_3();
	var button = $.first_child(fragment);
	var figure = $.child(button);
	var node = $.child(figure);

	Icon(node, { icon: 'solar:user-speak-rounded-bold', height: 'none' });
	$.reset(figure);

	var text = $.sibling(figure);

	$.reset(button);
	$.effect(() => $.event('pointerdown', button, startRecognition));
	$.effect(() => $.event('pointerup', button, stopRecognition));
	$.effect(() => $.event('pointerleave', button, stopRecognition));
	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), $ripple);

	var div = $.sibling(button, 2);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.transition(1, span, () => fade, () => ({ delay: $motion() / 2, duration: $motion() / 2 }));
			$.append($$anchor, span);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_1();
			var span_1 = $.first_child(fragment_1);
			var text_1 = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_2 = $.only_child(span_2, true);

			$.template_effect(() => {
				$.set_text(text_1, final);
				$.set_text(text_2, interim);
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var span_3 = root_2();
			var text_3 = $.only_child(span_3, true);

			$.template_effect(() => $.set_text(text_3, response));
			$.transition(3, span_3, () => fade, () => ({ delay: $motion() / 2, duration: $motion() / 2 }));
			$.append($$anchor, span_3);
		};

		$.if(node_1, ($$render) => {
			if (recognizing && !(final || interim)) $$render(consequent); else if (recognizing && (final || interim)) $$render(consequent_1, 1); else if (response) $$render(consequent_2, 2);
		});
	}

	$.reset(div);
	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => $lang()('say')]);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}