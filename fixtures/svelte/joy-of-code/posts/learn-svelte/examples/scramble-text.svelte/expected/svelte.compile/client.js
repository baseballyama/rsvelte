import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1739996">Scrambling Text Effect</p>`);
var root_1 = $.from_html(`<div class="container"><!> <button class="svelte-1739996">Scramble text</button></div>`);

export default function Scramble_text($$anchor) {
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

	let play = $.state(false);
	var div = root_1();
	var node_1 = $.child(div);

	$.key(node_1, () => $.get(play), ($$anchor) => {
		var p = root();

		$.transition(1, p, () => scrambleText);
		$.append($$anchor, p);
	});

	var button = $.sibling(node_1, 2);

	$.reset(div);
	$.delegated('click', button, () => $.set(play, !$.get(play)));
	$.append($$anchor, div);
}

$.delegate(['click']);