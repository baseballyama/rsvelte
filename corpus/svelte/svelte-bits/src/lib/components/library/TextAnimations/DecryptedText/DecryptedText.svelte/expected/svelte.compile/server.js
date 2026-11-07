import * as $ from 'svelte/internal/server';

export default function DecryptedText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			speed = 50,
			maxIterations = 10,
			sequential = false,
			revealDirection = 'start',
			useOriginalCharsOnly = false,
			characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
			class: className = '',
			parentClassName = '',
			encryptedClassName = '',
			animateOn = 'hover',
			clickMode = 'once'
		} = $$props;

		// svelte-ignore state_referenced_locally
		let displayText = text;

		let isAnimating = false;
		let revealedIndices = new Set();
		let hasAnimated = false;

		// svelte-ignore state_referenced_locally
		let isDecrypted = animateOn !== 'click';

		let direction = 'forward';
		let containerEl = void 0;
		let order = [];
		let pointer = 0;

		const availableChars = $.derived(() => useOriginalCharsOnly
			? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
			: characters.split(''));

		function shuffleText(originalText, currentRevealed) {
			return originalText.split('').map((char, i) => {
				if (char === ' ') return ' ';
				if (currentRevealed.has(i)) return originalText[i];

				return availableChars()[Math.floor(Math.random() * availableChars().length)];
			}).join('');
		}

		function computeOrder(len) {
			const out = [];

			if (len <= 0) return out;

			if (revealDirection === 'start') {
				for (let i = 0; i < len; i++) out.push(i);

				return out;
			}

			if (revealDirection === 'end') {
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

			for (let i = 0; i < text.length; i++) s.add(i);

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

			revealedIndices = empty;
			displayText = shuffleText(text, empty);
			isDecrypted = false;
		}

		function triggerDecrypt() {
			if (sequential) {
				order = computeOrder(text.length);
				pointer = 0;
				revealedIndices = new Set();
			} else {
				revealedIndices = new Set();
			}

			direction = 'forward';
			isAnimating = true;
		}

		function triggerReverse() {
			if (sequential) {
				order = computeOrder(text.length).slice().reverse();
				pointer = 0;
				revealedIndices = fillAllIndices();
				displayText = shuffleText(text, fillAllIndices());
			} else {
				revealedIndices = fillAllIndices();
				displayText = shuffleText(text, fillAllIndices());
			}

			direction = 'reverse';
			isAnimating = true;
		}

		function triggerHoverDecrypt() {
			if (isAnimating) return;

			revealedIndices = new Set();
			isDecrypted = false;
			displayText = text;
			direction = 'forward';
			isAnimating = true;
		}

		function resetToPlainText() {
			isAnimating = false;
			revealedIndices = new Set();
			displayText = text;
			isDecrypted = true;
			direction = 'forward';
		}

		function handleClick() {
			if (animateOn !== 'click') return;

			if (clickMode === 'once') {
				if (isDecrypted) return;

				direction = 'forward';
				triggerDecrypt();
			} else {
				if (isDecrypted) {
					triggerReverse();
				} else {
					direction = 'forward';
					triggerDecrypt();
				}
			}
		}

		const hoverProps = $.derived(() => animateOn === 'hover' || animateOn === 'inViewHover');
		const clickProps = $.derived(() => animateOn === 'click');

		$$renderer.push(`<span${$.attr_class($.clsx(parentClassName))} style="display:inline-block;white-space:pre-wrap;"><span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;">${$.escape(displayText)}</span> <span aria-hidden="true"><!--[-->`);

		const each_array = $.ensure_array_like(displayText.split(''));

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let char = each_array[index];
			const isRevealedOrDone = revealedIndices.has(index) || !isAnimating && isDecrypted;

			$$renderer.push(`<span${$.attr_class($.clsx(isRevealedOrDone ? className : encryptedClassName))}>${$.escape(char)}</span>`);
		}

		$$renderer.push(`<!--]--></span></span>`);
	});
}