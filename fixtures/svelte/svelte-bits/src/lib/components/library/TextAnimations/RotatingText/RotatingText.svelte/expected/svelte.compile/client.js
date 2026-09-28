import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from 'motion';

var root = $.from_html(`<span style="display:inline-block;"> </span>`);
var root_1 = $.from_html(`<span class="text-rotate-space" style="white-space:pre;"></span>`);
var root_2 = $.from_html(`<span style="display:inline-flex;"><!> <!></span>`);
var root_3 = $.from_html(`<span style="display:flex;flex-wrap:wrap;white-space:pre-wrap;position:relative;"><span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"> </span> <span aria-hidden="true"></span></span>`);

export default function RotatingText($$anchor, $$props) {
	$.push($$props, true);

	let rotationInterval = $.prop($$props, 'rotationInterval', 3, 2000),
		staggerDuration = $.prop($$props, 'staggerDuration', 3, 0),
		staggerFrom = $.prop($$props, 'staggerFrom', 3, 'first'),
		loop = $.prop($$props, 'loop', 3, true),
		auto = $.prop($$props, 'auto', 3, true),
		splitBy = $.prop($$props, 'splitBy', 3, 'characters'),
		mainClassName = $.prop($$props, 'mainClassName', 3, ''),
		splitLevelClassName = $.prop($$props, 'splitLevelClassName', 3, ''),
		elementLevelClassName = $.prop($$props, 'elementLevelClassName', 3, ''),
		transitionDamping = $.prop($$props, 'transitionDamping', 3, 25),
		transitionStiffness = $.prop($$props, 'transitionStiffness', 3, 300),
		initialY = $.prop($$props, 'initialY', 3, '100%'),
		animateY = $.prop($$props, 'animateY', 3, 0),
		exitY = $.prop($$props, 'exitY', 3, '-120%');

	let currentTextIndex = $.state(0);
	let displayedIndex = $.state(0);
	let isSwapping = $.state(false);
	let elementsByKey = {};

	function splitIntoCharacters(s) {
		if (typeof Intl !== 'undefined' && Intl.Segmenter) {
			const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

			return Array.from(segmenter.segment(s), (seg) => seg.segment);
		}

		return Array.from(s);
	}

	function splitText(value) {
		if (splitBy() === 'characters') {
			const words = value.split(' ');

			return words.map((word, i) => ({
				characters: splitIntoCharacters(word),
				needsSpace: i !== words.length - 1
			}));
		}

		if (splitBy() === 'words') {
			return value.split(' ').map((word, i, arr) => ({ characters: [word], needsSpace: i !== arr.length - 1 }));
		}

		if (splitBy() === 'lines') {
			return value.split('\n').map((line, i, arr) => ({ characters: [line], needsSpace: i !== arr.length - 1 }));
		}

		return value.split(splitBy()).map((part, i, arr) => ({ characters: [part], needsSpace: i !== arr.length - 1 }));
	}

	const elements = $.derived(() => splitText($$props.texts[$.get(displayedIndex)] ?? ''));
	const totalChars = $.derived(() => $.get(elements).reduce((sum, w) => sum + w.characters.length, 0));

	function getStaggerDelay(index, total) {
		if (staggerFrom() === 'first') return index * staggerDuration();
		if (staggerFrom() === 'last') return (total - 1 - index) * staggerDuration();

		if (staggerFrom() === 'center') {
			const center = Math.floor(total / 2);

			return Math.abs(center - index) * staggerDuration();
		}

		if (staggerFrom() === 'random') {
			const randomIndex = Math.floor(Math.random() * total);

			return Math.abs(randomIndex - index) * staggerDuration();
		}

		return Math.abs(staggerFrom() - index) * staggerDuration();
	}

	function collectElements() {
		const out = [];
		let charIdx = 0;

		for (const wordObj of $.get(elements)) {
			for (let c = 0; c < wordObj.characters.length; c++) {
				const node = elementsByKey[`${$.get(displayedIndex)}:${charIdx}`];

				if (node) out.push({ node, index: charIdx });

				charIdx++;
			}
		}

		return out;
	}

	async function animateIn() {
		const items = collectElements();

		const promises = items.map(({ node, index }) => {
			node.style.transform = `translateY(${typeof initialY() === 'number' ? initialY() + 'px' : initialY()})`;
			node.style.opacity = '0';

			const controls = animate(
				node,
				{
					y: typeof animateY() === 'number' ? animateY() : animateY(),
					opacity: 1
				},
				{
					type: 'spring',
					damping: transitionDamping(),
					stiffness: transitionStiffness(),
					delay: getStaggerDelay(index, $.get(totalChars))
				}
			);

			return controls.finished ?? Promise.resolve();
		});

		await Promise.all(promises);
	}

	async function animateOut() {
		const items = collectElements();

		if (items.length === 0) return;

		const promises = items.map(({ node, index }) => {
			const controls = animate(
				node,
				{
					y: typeof exitY() === 'number' ? exitY() : exitY(),
					opacity: 0
				},
				{
					type: 'spring',
					damping: transitionDamping(),
					stiffness: transitionStiffness(),
					delay: getStaggerDelay(index, $.get(totalChars))
				}
			);

			return controls.finished ?? Promise.resolve();
		});

		await Promise.all(promises);
	}

	function handleIndexChange(newIndex) {
		$.set(currentTextIndex, newIndex, true);
		$$props.onNext?.(newIndex);
	}

	function next() {
		const nextIndex = $.get(currentTextIndex) === $$props.texts.length - 1
			? loop() ? 0 : $.get(currentTextIndex)
			: $.get(currentTextIndex) + 1;

		if (nextIndex !== $.get(currentTextIndex)) handleIndexChange(nextIndex);
	}

	function previous() {
		const prevIndex = $.get(currentTextIndex) === 0
			? loop() ? $$props.texts.length - 1 : $.get(currentTextIndex)
			: $.get(currentTextIndex) - 1;

		if (prevIndex !== $.get(currentTextIndex)) handleIndexChange(prevIndex);
	}

	function jumpTo(index) {
		const validIndex = Math.max(0, Math.min(index, $$props.texts.length - 1));

		if (validIndex !== $.get(currentTextIndex)) handleIndexChange(validIndex);
	}

	function reset() {
		if ($.get(currentTextIndex) !== 0) handleIndexChange(0);
	}

	$.user_effect(() => {
		if (!auto()) return;

		void rotationInterval();

		const id = setInterval(() => next(), rotationInterval());

		return () => clearInterval(id);
	});

	let firstRender = true;

	$.user_effect(() => {
		void $.get(displayedIndex);

		if (firstRender) {
			firstRender = false;
			queueMicrotask(() => animateIn());
		}
	});

	$.user_effect(() => {
		void $.get(currentTextIndex);

		if ($.get(currentTextIndex) === $.get(displayedIndex)) return;
		if ($.get(isSwapping)) return;

		$.set(isSwapping, true);

		(async () => {
			await animateOut();
			$.set(displayedIndex, $.get(currentTextIndex), true);
			await Promise.resolve();
			await animateIn();
			$.set(isSwapping, false);

			if ($.get(currentTextIndex) !== $.get(displayedIndex)) {
				const target = $.get(currentTextIndex);

				queueMicrotask(() => {
					if (target !== $.get(displayedIndex) && !$.get(isSwapping)) {
						$.set(isSwapping, true);

						(async () => {
							await animateOut();
							$.set(displayedIndex, target, true);
							await Promise.resolve();
							await animateIn();
							$.set(isSwapping, false);
						})();
					}
				});
			}
		})();
	});

	var $$exports = { next, previous, jumpTo, reset };
	var span = root_3();
	var span_1 = $.child(span);
	var text = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1, 2);

	$.each(span_2, 21, () => $.get(elements), $.index, ($$anchor, wordObj, wordIndex) => {
		const previousCharsCount = $.derived(() => $.get(elements).slice(0, wordIndex).reduce((sum, w) => sum + w.characters.length, 0));
		var span_3 = root_2();
		var node_1 = $.child(span_3);

		$.each(node_1, 17, () => $.get(wordObj).characters, $.index, ($$anchor, char, charIndex) => {
			var span_4 = root();
			var text_1 = $.only_child(span_4, true);

			$.bind_this(span_4, ($$value, previousCharsCount, charIndex) => elementsByKey[`${$.get(displayedIndex)}:${previousCharsCount + charIndex}`] = $$value, (previousCharsCount, charIndex) => elementsByKey?.[`${$.get(displayedIndex)}:${previousCharsCount + charIndex}`], () => [$.get(previousCharsCount), charIndex]);

			$.template_effect(() => {
				$.set_class(span_4, 1, `text-rotate-element ${elementLevelClassName() ?? ''}`);
				$.set_text(text_1, $.get(char));
			});

			$.append($$anchor, span_4);
		});

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent = ($$anchor) => {
				var span_5 = root_1();

				$.append($$anchor, span_5);
			};

			$.if(node_2, ($$render) => {
				if ($.get(wordObj).needsSpace) $$render(consequent);
			});
		}

		$.reset(span_3);
		$.template_effect(() => $.set_class(span_3, 1, `text-rotate-word ${splitLevelClassName() ?? ''}`));
		$.append($$anchor, span_3);
	});

	$.reset(span_2);
	$.reset(span);

	$.template_effect(() => {
		$.set_class(span, 1, `text-rotate ${mainClassName() ?? ''}`);
		$.set_text(text, $$props.texts[$.get(currentTextIndex)]);
		$.set_class(span_2, 1, $.clsx(splitBy() === 'lines' ? 'text-rotate-lines' : 'text-rotate'));

		$.set_style(span_2, splitBy() === 'lines'
			? 'display:flex;flex-direction:column;width:100%;'
			: 'display:flex;flex-wrap:wrap;white-space:pre-wrap;position:relative;');
	});

	$.append($$anchor, span);

	return $.pop($$exports);
}