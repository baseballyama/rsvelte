import 'svelte/internal/disclose-version';
import { gsap } from 'gsap';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<span class="text-type__content"> </span> <!>`, 1);

export default function TextType($$anchor, $$props) {
	$.push($$props, true);

	let tag = $.prop($$props, 'as', 3, 'div'),
		typingSpeed = $.prop($$props, 'typingSpeed', 3, 50),
		initialDelay = $.prop($$props, 'initialDelay', 3, 0),
		pauseDuration = $.prop($$props, 'pauseDuration', 3, 2000),
		deletingSpeed = $.prop($$props, 'deletingSpeed', 3, 30),
		loop = $.prop($$props, 'loop', 3, true),
		className = $.prop($$props, 'class', 3, ''),
		showCursor = $.prop($$props, 'showCursor', 3, true),
		hideCursorWhileTyping = $.prop($$props, 'hideCursorWhileTyping', 3, false),
		cursorCharacter = $.prop($$props, 'cursorCharacter', 3, '|'),
		cursorClassName = $.prop($$props, 'cursorClassName', 3, ''),
		cursorBlinkDuration = $.prop($$props, 'cursorBlinkDuration', 3, 0.5),
		textColors = $.prop($$props, 'textColors', 19, () => []),
		startOnVisible = $.prop($$props, 'startOnVisible', 3, false),
		reverseMode = $.prop($$props, 'reverseMode', 3, false);

	let displayedText = $.state('');
	let currentCharIndex = $.state(0);
	let isDeleting = $.state(false);
	let currentTextIndex = $.state(0);

	// svelte-ignore state_referenced_locally
	let isVisible = $.state(!startOnVisible());

	let containerEl = $.state(void 0);
	let cursorEl = $.state(void 0);
	const textArray = $.derived(() => Array.isArray($$props.text) ? $$props.text : [$$props.text]);

	function getRandomSpeed() {
		if (!$$props.variableSpeed) return typingSpeed();

		const { min, max } = $$props.variableSpeed;

		return Math.random() * (max - min) + min;
	}

	function getCurrentTextColor() {
		if (textColors().length === 0) return 'inherit';

		return textColors()[$.get(currentTextIndex) % textColors().length];
	}

	const shouldHideCursor = $.derived(() => hideCursorWhileTyping() && ($.get(currentCharIndex) < ($.get(textArray)[$.get(currentTextIndex)]?.length ?? 0) || $.get(isDeleting)));

	$.user_effect(() => {
		if (!startOnVisible()) return;
		if (!$.get(containerEl)) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) $.set(isVisible, true);
				});
			},
			{ threshold: 0.1 }
		);

		observer.observe($.get(containerEl));

		return () => observer.disconnect();
	});

	$.user_effect(() => {
		if (!showCursor() || !$.get(cursorEl)) return;

		gsap.set($.get(cursorEl), { opacity: 1 });

		const tween = gsap.to($.get(cursorEl), {
			opacity: 0,
			duration: cursorBlinkDuration(),
			repeat: -1,
			yoyo: true,
			ease: 'power2.inOut'
		});

		return () => {
			tween.kill();
		};
	});

	$.user_effect(() => {
		if (!$.get(isVisible)) return;

		void $.get(currentCharIndex);
		void $.get(displayedText);
		void $.get(isDeleting);
		void typingSpeed();
		void deletingSpeed();
		void pauseDuration();
		void $.get(textArray);
		void $.get(currentTextIndex);
		void loop();
		void initialDelay();
		void reverseMode();
		void $$props.variableSpeed;

		let timeout;
		const currentText = $.get(textArray)[$.get(currentTextIndex)];

		if (currentText === undefined) return;

		const processedText = reverseMode()
			? currentText.split('').reverse().join('')
			: currentText;

		const tick = () => {
			if ($.get(isDeleting)) {
				if ($.get(displayedText) === '') {
					$.set(isDeleting, false);

					if ($.get(currentTextIndex) === $.get(textArray).length - 1 && !loop()) return;

					$$props.onSentenceComplete?.($.get(textArray)[$.get(currentTextIndex)], $.get(currentTextIndex));
					$.set(currentTextIndex, ($.get(currentTextIndex) + 1) % $.get(textArray).length);
					$.set(currentCharIndex, 0);
					timeout = setTimeout(() => {}, pauseDuration());
				} else {
					timeout = setTimeout(
						() => {
							$.set(displayedText, $.get(displayedText).slice(0, -1), true);
						},
						deletingSpeed()
					);
				}
			} else {
				if ($.get(currentCharIndex) < processedText.length) {
					timeout = setTimeout(
						() => {
							$.set(displayedText, $.get(displayedText) + processedText[$.get(currentCharIndex)]);
							$.set(currentCharIndex, $.get(currentCharIndex) + 1);
						},
						$$props.variableSpeed ? getRandomSpeed() : typingSpeed()
					);
				} else if ($.get(textArray).length >= 1) {
					if (!loop() && $.get(currentTextIndex) === $.get(textArray).length - 1) return;

					timeout = setTimeout(
						() => {
							$.set(isDeleting, true);
						},
						pauseDuration()
					);
				}
			}
		};

		if ($.get(currentCharIndex) === 0 && !$.get(isDeleting) && $.get(displayedText) === '') {
			timeout = setTimeout(tick, initialDelay());
		} else {
			tick();
		}

		return () => {
			if (timeout !== undefined) clearTimeout(timeout);
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, tag, false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => $.set(containerEl, $$value, true), () => $.get(containerEl));

		$.attribute_effect($$element, () => ({
			class: `text-type inline-block whitespace-pre-wrap ${className() ?? ''}`
		}));

		var fragment_1 = root_1();
		var span = $.first_child(fragment_1);
		let styles;
		var text_1 = $.only_child(span, true);
		var node_1 = $.sibling(span, 2);

		{
			var consequent = ($$anchor) => {
				var span_1 = root();
				var text_2 = $.only_child(span_1, true);

				$.bind_this(span_1, ($$value) => $.set(cursorEl, $$value), () => $.get(cursorEl));

				$.template_effect(() => {
					$.set_class(span_1, 1, `ml-1 inline-block ${cursorClassName() ?? ''} ${$.get(shouldHideCursor) ? 'hidden' : ''}`);
					$.set_text(text_2, cursorCharacter());
				});

				$.append($$anchor, span_1);
			};

			$.if(node_1, ($$render) => {
				if (showCursor()) $$render(consequent);
			});
		}

		$.template_effect(
			($0) => {
				styles = $.set_style(span, '', styles, { color: $0 });
				$.set_text(text_1, $.get(displayedText));
			},
			[() => getCurrentTextColor() || 'inherit']
		);

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}