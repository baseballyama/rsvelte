import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';

export default function TextType($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			as: tag = 'div',
			typingSpeed = 50,
			initialDelay = 0,
			pauseDuration = 2000,
			deletingSpeed = 30,
			loop = true,
			class: className = '',
			showCursor = true,
			hideCursorWhileTyping = false,
			cursorCharacter = '|',
			cursorClassName = '',
			cursorBlinkDuration = 0.5,
			textColors = [],
			variableSpeed,
			onSentenceComplete,
			startOnVisible = false,
			reverseMode = false
		} = $$props;

		let displayedText = '';
		let currentCharIndex = 0;
		let isDeleting = false;
		let currentTextIndex = 0;

		// svelte-ignore state_referenced_locally
		let isVisible = !startOnVisible;

		let containerEl = void 0;
		let cursorEl = void 0;
		const textArray = $.derived(() => Array.isArray(text) ? text : [text]);

		function getRandomSpeed() {
			if (!variableSpeed) return typingSpeed;

			const { min, max } = variableSpeed;

			return Math.random() * (max - min) + min;
		}

		function getCurrentTextColor() {
			if (textColors.length === 0) return 'inherit';

			return textColors[currentTextIndex % textColors.length];
		}

		const shouldHideCursor = $.derived(() => hideCursorWhileTyping && (currentCharIndex < (textArray()[currentTextIndex]?.length ?? 0) || isDeleting));

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attr_class(`text-type inline-block whitespace-pre-wrap ${$.stringify(className)}`)}`);
			},
			() => {
				$$renderer.push(`<span class="text-type__content"${$.attr_style('', { color: getCurrentTextColor() || 'inherit' })}>${$.escape(displayedText)}</span> `);

				if (showCursor) {
					$$renderer.push(`<!--[0--><span${$.attr_class(`ml-1 inline-block ${$.stringify(cursorClassName)} ${shouldHideCursor() ? 'hidden' : ''}`)}>${$.escape(cursorCharacter)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		);
	});
}