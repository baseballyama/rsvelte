import * as $ from 'svelte/internal/server';
import { connection, lang, motion, selectedLanguage, ripple } from '$lib/Stores';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import Ripple from 'svelte-ripple';

export default function SayButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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
							language: $.store_get($$store_subs ??= {}, '$selectedLanguage', selectedLanguage)
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
				speech.lang = $.store_get($$store_subs ??= {}, '$selectedLanguage', selectedLanguage);

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

		$$renderer.push(`<button class="button"><figure>`);
		Icon($$renderer, { icon: 'solar:user-speak-rounded-bold', height: 'none' });
		$$renderer.push(`<!----></figure> ${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('say'))}</button> <div class="response svelte-10agxu6">`);

		if (recognizing && !(final || interim)) {
			$$renderer.push(`<!--[0--><span>...</span>`);
		} else if (recognizing && (final || interim)) {
			$$renderer.push(`<!--[1--><span>${$.escape(final)}</span> <span>${$.escape(interim)}</span>`);
		} else if (response) {
			$$renderer.push(`<!--[2--><span>${$.escape(response)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}