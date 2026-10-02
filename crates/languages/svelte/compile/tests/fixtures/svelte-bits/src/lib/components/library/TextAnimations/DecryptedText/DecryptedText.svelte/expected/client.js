import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<span style="display:inline-block;white-space:pre-wrap;"><span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;"> </span> <span aria-hidden="true"></span></span>`);

export default function DecryptedText($$anchor, $$props) {
	$.push($$props, true);

	let speed = $.prop($$props, 'speed', 3, 50),
		maxIterations = $.prop($$props, 'maxIterations', 3, 10),
		sequential = $.prop($$props, 'sequential', 3, false),
		revealDirection = $.prop($$props, 'revealDirection', 3, 'start'),
		useOriginalCharsOnly = $.prop($$props, 'useOriginalCharsOnly', 3, false),
		characters = $.prop($$props, 'characters', 3, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+'),
		className = $.prop($$props, 'class', 3, ''),
		parentClassName = $.prop($$props, 'parentClassName', 3, ''),
		encryptedClassName = $.prop($$props, 'encryptedClassName', 3, ''),
		animateOn = $.prop($$props, 'animateOn', 3, 'hover'),
		clickMode = $.prop($$props, 'clickMode', 3, 'once');

	// svelte-ignore state_referenced_locally
	let displayText = $.state($.proxy($$props.text));

	let isAnimating = $.state(false);
	let revealedIndices = $.state($.proxy(new Set()));
	let hasAnimated = $.state(false);

	// svelte-ignore state_referenced_locally
	let isDecrypted = $.state(animateOn() !== 'click');

	let direction = $.state('forward');
	let containerEl = $.state(void 0);
	let order = [];
	let pointer = 0;

	const availableChars = $.derived(() => useOriginalCharsOnly()
		? Array.from(new Set($$props.text.split(''))).filter((c) => c !== ' ')
		: characters().split(''));

	function shuffleText(originalText, currentRevealed) {
		return originalText.split('').map((char, i) => {
			if (char === ' ') return ' ';
			if (currentRevealed.has(i)) return originalText[i];

			return $.get(availableChars)[Math.floor(Math.random() * $.get(availableChars).length)];
		}).join('');
	}

	function computeOrder(len) {
		const out = [];

		if (len <= 0) return out;

		if (revealDirection() === 'start') {
			for (let i = 0; i < len; i++) out.push(i);

			return out;
		}

		if (revealDirection() === 'end') {
			for (let i = len - 1; i >= 0; i--) out.push(i);

			return out;
		}

		const middle = Math.floor(len / 2);
		let offset = 0;

		while (out.length < len) {
			if (offset % 2 === 0) {
				const idx = middle + offset / 2;

				if (idx >= 0 && idx < len) out.push(idx);
			} else {
				const idx = middle - Math.ceil(offset / 2);

				if (idx >= 0 && idx < len) out.push(idx);
			}

			offset++;
		}

		return out.slice(0, len);
	}

	function fillAllIndices() {
		const s = new Set();

		for (let i = 0; i < $$props.text.length; i++) s.add(i);

		return s;
	}

	function removeRandomIndices(set, count) {
		const arr = Array.from(set);

		for (let i = 0; i < count && arr.length > 0; i++) {
			const idx = Math.floor(Math.random() * arr.length);

			arr.splice(idx, 1);
		}

		return new Set(arr);
	}

	function encryptInstantly() {
		const empty = new Set();

		$.set(revealedIndices, empty, true);
		$.set(displayText, shuffleText($$props.text, empty), true);
		$.set(isDecrypted, false);
	}

	function triggerDecrypt() {
		if (sequential()) {
			order = computeOrder($$props.text.length);
			pointer = 0;
			$.set(revealedIndices, new Set(), true);
		} else {
			$.set(revealedIndices, new Set(), true);
		}

		$.set(direction, 'forward');
		$.set(isAnimating, true);
	}

	function triggerReverse() {
		if (sequential()) {
			order = computeOrder($$props.text.length).slice().reverse();
			pointer = 0;
			$.set(revealedIndices, fillAllIndices(), true);
			$.set(displayText, shuffleText($$props.text, fillAllIndices()), true);
		} else {
			$.set(revealedIndices, fillAllIndices(), true);
			$.set(displayText, shuffleText($$props.text, fillAllIndices()), true);
		}

		$.set(direction, 'reverse');
		$.set(isAnimating, true);
	}

	function triggerHoverDecrypt() {
		if ($.get(isAnimating)) return;

		$.set(revealedIndices, new Set(), true);
		$.set(isDecrypted, false);
		$.set(displayText, $$props.text, true);
		$.set(direction, 'forward');
		$.set(isAnimating, true);
	}

	function resetToPlainText() {
		$.set(isAnimating, false);
		$.set(revealedIndices, new Set(), true);
		$.set(displayText, $$props.text, true);
		$.set(isDecrypted, true);
		$.set(direction, 'forward');
	}

	function handleClick() {
		if (animateOn() !== 'click') return;

		if (clickMode() === 'once') {
			if ($.get(isDecrypted)) return;

			$.set(direction, 'forward');
			triggerDecrypt();
		} else {
			if ($.get(isDecrypted)) {
				triggerReverse();
			} else {
				$.set(direction, 'forward');
				triggerDecrypt();
			}
		}
	}

	$.user_effect(() => {
		if (animateOn() === 'click') {
			encryptInstantly();
		} else {
			$.set(displayText, $$props.text, true);
			$.set(isDecrypted, true);
		}

		$.set(revealedIndices, new Set(), true);
		$.set(direction, 'forward');
	});

	$.user_effect(() => {
		if (!$.get(isAnimating)) return;

		void $.get(direction);
		void speed();
		void sequential();
		void maxIterations();
		void revealDirection();

		let currentIteration = 0;

		const getNextIndex = (revealedSet) => {
			const len = $$props.text.length;

			switch (revealDirection()) {
				case 'start':
					return revealedSet.size;

				case 'end':
					return len - 1 - revealedSet.size;

				case 'center':
					{
						const middle = Math.floor(len / 2);
						const offset = Math.floor(revealedSet.size / 2);
						const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

						if (nextIndex >= 0 && nextIndex < len && !revealedSet.has(nextIndex)) return nextIndex;

						for (let i = 0; i < len; i++) {
							if (!revealedSet.has(i)) return i;
						}

						return 0;
					}

				default:
					return revealedSet.size;
			}
		};

		const id = setInterval(
			() => {
				const prev = $.get(revealedIndices);

				if (sequential()) {
					if ($.get(direction) === 'forward') {
						if (prev.size < $$props.text.length) {
							const nextIndex = getNextIndex(prev);
							const next = new Set(prev);

							next.add(nextIndex);
							$.set(displayText, shuffleText($$props.text, next), true);
							$.set(revealedIndices, next, true);
						} else {
							clearInterval(id);
							$.set(isAnimating, false);
							$.set(isDecrypted, true);
						}
					} else {
						if (pointer < order.length) {
							const idxToRemove = order[pointer++];
							const next = new Set(prev);

							next.delete(idxToRemove);
							$.set(displayText, shuffleText($$props.text, next), true);

							if (next.size === 0) {
								clearInterval(id);
								$.set(isAnimating, false);
								$.set(isDecrypted, false);
							}

							$.set(revealedIndices, next, true);
						} else {
							clearInterval(id);
							$.set(isAnimating, false);
							$.set(isDecrypted, false);
						}
					}
				} else {
					if ($.get(direction) === 'forward') {
						$.set(displayText, shuffleText($$props.text, prev), true);
						currentIteration++;

						if (currentIteration >= maxIterations()) {
							clearInterval(id);
							$.set(isAnimating, false);
							$.set(displayText, $$props.text, true);
							$.set(isDecrypted, true);
						}
					} else {
						let currentSet = prev;

						if (currentSet.size === 0) currentSet = fillAllIndices();

						const removeCount = Math.max(1, Math.ceil($$props.text.length / Math.max(1, maxIterations())));
						const next = removeRandomIndices(currentSet, removeCount);

						$.set(displayText, shuffleText($$props.text, next), true);
						currentIteration++;

						if (next.size === 0 || currentIteration >= maxIterations()) {
							clearInterval(id);
							$.set(isAnimating, false);
							$.set(isDecrypted, false);
							$.set(displayText, shuffleText($$props.text, new Set()), true);
							$.set(revealedIndices, new Set(), true);
						} else {
							$.set(revealedIndices, next, true);
						}
					}
				}
			},
			speed()
		);

		return () => clearInterval(id);
	});

	$.user_effect(() => {
		if (animateOn() !== 'view' && animateOn() !== 'inViewHover') return;
		if (!$.get(containerEl)) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !$.get(hasAnimated)) {
						triggerDecrypt();
						$.set(hasAnimated, true);
					}
				});
			},
			{ root: null, rootMargin: '0px', threshold: 0.1 }
		);

		observer.observe($.get(containerEl));

		return () => observer.disconnect();
	});

	const hoverProps = $.derived(() => animateOn() === 'hover' || animateOn() === 'inViewHover');
	const clickProps = $.derived(() => animateOn() === 'click');
	var span = root_1();
	var span_1 = $.child(span);
	var text_1 = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1, 2);

	$.each(span_2, 21, () => $.get(displayText).split(''), $.index, ($$anchor, char, index) => {
		const isRevealedOrDone = $.derived(() => $.get(revealedIndices).has(index) || !$.get(isAnimating) && $.get(isDecrypted));
		var span_3 = root();
		var text_2 = $.only_child(span_3, true);

		$.template_effect(() => {
			$.set_class(span_3, 1, $.clsx($.get(isRevealedOrDone) ? className() : encryptedClassName()));
			$.set_text(text_2, $.get(char));
		});

		$.append($$anchor, span_3);
	});

	$.reset(span_2);
	$.reset(span);
	$.bind_this(span, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));

	$.template_effect(() => {
		$.set_class(span, 1, $.clsx(parentClassName()));
		$.set_text(text_1, $.get(displayText));
	});

	$.event('mouseenter', span, function (...$$args) {
		($.get(hoverProps) ? triggerHoverDecrypt : undefined)?.apply(this, $$args);
	});

	$.event('mouseleave', span, function (...$$args) {
		($.get(hoverProps) ? resetToPlainText : undefined)?.apply(this, $$args);
	});

	$.delegated('click', span, function (...$$args) {
		($.get(clickProps) ? handleClick : undefined)?.apply(this, $$args);
	});

	$.append($$anchor, span);
	$.pop();
}

$.delegate(['click']);