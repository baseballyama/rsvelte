import * as $ from 'svelte/internal/server';
import { animate } from 'motion';

export default function RotatingText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			texts,
			rotationInterval = 2000,
			staggerDuration = 0,
			staggerFrom = 'first',
			loop = true,
			auto = true,
			splitBy = 'characters',
			mainClassName = '',
			splitLevelClassName = '',
			elementLevelClassName = '',
			transitionDamping = 25,
			transitionStiffness = 300,
			initialY = '100%',
			animateY = 0,
			exitY = '-120%',
			onNext
		} = $$props;

		let currentTextIndex = 0;
		let displayedIndex = 0;
		let isSwapping = false;
		let elementsByKey = {};

		function splitIntoCharacters(s) {
			if (typeof Intl !== 'undefined' && Intl.Segmenter) {
				const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

				return Array.from(segmenter.segment(s), (seg) => seg.segment);
			}

			return Array.from(s);
		}

		function splitText(value) {
			if (splitBy === 'characters') {
				const words = value.split(' ');

				return words.map((word, i) => ({
					characters: splitIntoCharacters(word),
					needsSpace: i !== words.length - 1
				}));
			}

			if (splitBy === 'words') {
				return value.split(' ').map((word, i, arr) => ({ characters: [word], needsSpace: i !== arr.length - 1 }));
			}

			if (splitBy === 'lines') {
				return value.split('\n').map((line, i, arr) => ({ characters: [line], needsSpace: i !== arr.length - 1 }));
			}

			return value.split(splitBy).map((part, i, arr) => ({ characters: [part], needsSpace: i !== arr.length - 1 }));
		}

		const elements = $.derived(() => splitText(texts[displayedIndex] ?? ''));
		const totalChars = $.derived(() => elements().reduce((sum, w) => sum + w.characters.length, 0));

		function getStaggerDelay(index, total) {
			if (staggerFrom === 'first') return index * staggerDuration;
			if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;

			if (staggerFrom === 'center') {
				const center = Math.floor(total / 2);

				return Math.abs(center - index) * staggerDuration;
			}

			if (staggerFrom === 'random') {
				const randomIndex = Math.floor(Math.random() * total);

				return Math.abs(randomIndex - index) * staggerDuration;
			}

			return Math.abs(staggerFrom - index) * staggerDuration;
		}

		function collectElements() {
			const out = [];
			let charIdx = 0;

			for (const wordObj of elements()) {
				for (let c = 0; c < wordObj.characters.length; c++) {
					const node = elementsByKey[`${displayedIndex}:${charIdx}`];

					if (node) out.push({ node, index: charIdx });

					charIdx++;
				}
			}

			return out;
		}

		async function animateIn() {
			const items = collectElements();

			const promises = items.map(({ node, index }) => {
				node.style.transform = `translateY(${typeof initialY === 'number' ? initialY + 'px' : initialY})`;
				node.style.opacity = '0';

				const controls = animate(
					node,
					{
						y: typeof animateY === 'number' ? animateY : animateY,
						opacity: 1
					},
					{
						type: 'spring',
						damping: transitionDamping,
						stiffness: transitionStiffness,
						delay: getStaggerDelay(index, totalChars())
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
				const controls = animate(node, { y: typeof exitY === 'number' ? exitY : exitY, opacity: 0 }, {
					type: 'spring',
					damping: transitionDamping,
					stiffness: transitionStiffness,
					delay: getStaggerDelay(index, totalChars())
				});

				return controls.finished ?? Promise.resolve();
			});

			await Promise.all(promises);
		}

		function handleIndexChange(newIndex) {
			currentTextIndex = newIndex;
			onNext?.(newIndex);
		}

		function next() {
			const nextIndex = currentTextIndex === texts.length - 1 ? loop ? 0 : currentTextIndex : currentTextIndex + 1;

			if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
		}

		function previous() {
			const prevIndex = currentTextIndex === 0
				? loop ? texts.length - 1 : currentTextIndex
				: currentTextIndex - 1;

			if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
		}

		function jumpTo(index) {
			const validIndex = Math.max(0, Math.min(index, texts.length - 1));

			if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
		}

		function reset() {
			if (currentTextIndex !== 0) handleIndexChange(0);
		}

		let firstRender = true;

		$$renderer.push(`<span${$.attr_class(`text-rotate ${$.stringify(mainClassName)}`)} style="display:flex;flex-wrap:wrap;white-space:pre-wrap;position:relative;"><span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${$.escape(texts[currentTextIndex])}</span> <span${$.attr_class($.clsx(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate'))}${$.attr_style(splitBy === 'lines'
			? 'display:flex;flex-direction:column;width:100%;'
			: 'display:flex;flex-wrap:wrap;white-space:pre-wrap;position:relative;')} aria-hidden="true"><!--[-->`);

		const each_array = $.ensure_array_like(elements());

		for (let wordIndex = 0, $$length = each_array.length; wordIndex < $$length; wordIndex++) {
			let wordObj = each_array[wordIndex];
			const previousCharsCount = elements().slice(0, wordIndex).reduce((sum, w) => sum + w.characters.length, 0);

			$$renderer.push(`<span${$.attr_class(`text-rotate-word ${$.stringify(splitLevelClassName)}`)} style="display:inline-flex;"><!--[-->`);

			const each_array_1 = $.ensure_array_like(wordObj.characters);

			for (let charIndex = 0, $$length = each_array_1.length; charIndex < $$length; charIndex++) {
				let char = each_array_1[charIndex];

				$$renderer.push(`<span${$.attr_class(`text-rotate-element ${$.stringify(elementLevelClassName)}`)} style="display:inline-block;">${$.escape(char)}</span>`);
			}

			$$renderer.push(`<!--]--> `);

			if (wordObj.needsSpace) {
				$$renderer.push(`<!--[0--><span class="text-rotate-space" style="white-space:pre;"></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]--></span></span>`);
		$.bind_props($$props, { next, previous, jumpTo, reset });
	});
}