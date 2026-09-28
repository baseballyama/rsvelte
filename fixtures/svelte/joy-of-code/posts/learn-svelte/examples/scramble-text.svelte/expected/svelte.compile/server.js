import * as $ from 'svelte/internal/server';

export default function Scramble_text($$renderer) {
	const chars = '!@#$%&*1234567890-=_+[]{}|;:,.<>/?';

	function getRandomCharacter() {
		return chars[Math.floor(Math.random() * chars.length)];
	}

	function scrambleText(node, options) {
		const { duration = 4000 } = options;
		const finalText = node.textContent;
		const length = finalText.length;

		return {
			duration,
			tick: (t) => {
				let output = '';

				for (let i = 0; i < length; i++) {
					if (t > i / length) {
						output += finalText[i];
					} else {
						output += getRandomCharacter();
					}
				}

				node.textContent = output;
			}
		};
	}

	let play = false;

	$$renderer.push(`<div class="container"><!---->`);

	{
		$$renderer.push(`<p class="svelte-1739996">Scrambling Text Effect</p>`);
	}

	$$renderer.push(`<!----> <button class="svelte-1739996">Scramble text</button></div>`);
}