import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<canvas></canvas>`);

export default function FuzzyText($$anchor, $$props) {
	$.push($$props, true);

	let text = $.prop($$props, 'text', 3, ''),
		fontSize = $.prop($$props, 'fontSize', 3, 'clamp(2rem, 10vw, 10rem)'),
		fontWeight = $.prop($$props, 'fontWeight', 3, 900),
		fontFamily = $.prop($$props, 'fontFamily', 3, 'inherit'),
		color = $.prop($$props, 'color', 3, '#fff'),
		enableHover = $.prop($$props, 'enableHover', 3, true),
		baseIntensity = $.prop($$props, 'baseIntensity', 3, 0.18),
		hoverIntensity = $.prop($$props, 'hoverIntensity', 3, 0.5),
		fuzzRange = $.prop($$props, 'fuzzRange', 3, 30),
		fps = $.prop($$props, 'fps', 3, 60),
		direction = $.prop($$props, 'direction', 3, 'horizontal'),
		transitionDuration = $.prop($$props, 'transitionDuration', 3, 0),
		clickEffect = $.prop($$props, 'clickEffect', 3, false),
		glitchMode = $.prop($$props, 'glitchMode', 3, false),
		glitchInterval = $.prop($$props, 'glitchInterval', 3, 2000),
		glitchDuration = $.prop($$props, 'glitchDuration', 3, 200),
		gradient = $.prop($$props, 'gradient', 3, null),
		letterSpacing = $.prop($$props, 'letterSpacing', 3, 0),
		className = $.prop($$props, 'class', 3, '');

	let canvasEl = $.state(void 0);

	$.user_effect(() => {
		void text();
		void fontSize();
		void fontWeight();
		void fontFamily();
		void color();
		void enableHover();
		void baseIntensity();
		void hoverIntensity();
		void fuzzRange();
		void fps();
		void direction();
		void transitionDuration();
		void clickEffect();
		void glitchMode();
		void glitchInterval();
		void glitchDuration();
		void gradient();
		void letterSpacing();

		let animationFrameId = 0;
		let isCancelled = false;
		let glitchTimeoutId;
		let glitchEndTimeoutId;
		let clickTimeoutId;
		let teardown = null;
		const canvas = $.get(canvasEl);

		if (!canvas) return;

		const init = async () => {
			const ctx = canvas.getContext('2d');

			if (!ctx) return;

			const computedFontFamily = fontFamily() === 'inherit'
				? window.getComputedStyle(canvas).fontFamily || 'sans-serif'
				: fontFamily();

			const fontSizeStr = typeof fontSize() === 'number' ? `${fontSize()}px` : fontSize();
			const fontString = `${fontWeight()} ${fontSizeStr} ${computedFontFamily}`;

			try {
				await document.fonts.load(fontString);
			} catch {
				await document.fonts.ready;
			}

			if (isCancelled) return;

			let numericFontSize;

			if (typeof fontSize() === 'number') {
				numericFontSize = fontSize();
			} else {
				const temp = document.createElement('span');

				temp.style.fontSize = fontSize();
				document.body.appendChild(temp);

				const computedSize = window.getComputedStyle(temp).fontSize;

				numericFontSize = parseFloat(computedSize);
				document.body.removeChild(temp);
			}

			const offscreen = document.createElement('canvas');
			const offCtx = offscreen.getContext('2d');

			if (!offCtx) return;

			offCtx.font = `${fontWeight()} ${fontSizeStr} ${computedFontFamily}`;
			offCtx.textBaseline = 'alphabetic';

			let totalWidth = 0;

			if (letterSpacing() !== 0) {
				for (const char of text()) {
					totalWidth += offCtx.measureText(char).width + letterSpacing();
				}

				totalWidth -= letterSpacing();
			} else {
				totalWidth = offCtx.measureText(text()).width;
			}

			const metrics = offCtx.measureText(text());
			const actualLeft = metrics.actualBoundingBoxLeft ?? 0;

			const actualRight = letterSpacing() !== 0
				? totalWidth
				: metrics.actualBoundingBoxRight ?? metrics.width;

			const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
			const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;
			const textBoundingWidth = Math.ceil(letterSpacing() !== 0 ? totalWidth : actualLeft + actualRight);
			const tightHeight = Math.ceil(actualAscent + actualDescent);
			const extraWidthBuffer = 10;
			const offscreenWidth = textBoundingWidth + extraWidthBuffer;

			offscreen.width = offscreenWidth;
			offscreen.height = tightHeight;

			const xOffset = extraWidthBuffer / 2;

			offCtx.font = `${fontWeight()} ${fontSizeStr} ${computedFontFamily}`;
			offCtx.textBaseline = 'alphabetic';

			if (gradient() && Array.isArray(gradient()) && gradient().length >= 2) {
				const grad = offCtx.createLinearGradient(0, 0, offscreenWidth, 0);

				gradient().forEach((c, i) => grad.addColorStop(i / (gradient().length - 1), c));
				offCtx.fillStyle = grad;
			} else {
				offCtx.fillStyle = color();
			}

			if (letterSpacing() !== 0) {
				let xPos = xOffset;

				for (const char of text()) {
					offCtx.fillText(char, xPos, actualAscent);
					xPos += offCtx.measureText(char).width + letterSpacing();
				}
			} else {
				offCtx.fillText(text(), xOffset - actualLeft, actualAscent);
			}

			const horizontalMargin = fuzzRange() + 20;
			const verticalMargin = 0;

			canvas.width = offscreenWidth + horizontalMargin * 2;
			canvas.height = tightHeight + verticalMargin * 2;
			ctx.translate(horizontalMargin, verticalMargin);

			const interactiveLeft = horizontalMargin + xOffset;
			const interactiveTop = verticalMargin;
			const interactiveRight = interactiveLeft + textBoundingWidth;
			const interactiveBottom = interactiveTop + tightHeight;
			let isHovering = false;
			let isClicking = false;
			let isGlitching = false;
			let currentIntensity = baseIntensity();
			let targetIntensity = baseIntensity();
			let lastFrameTime = 0;
			const frameDuration = 1000 / fps();

			const startGlitchLoop = () => {
				if (!glitchMode() || isCancelled) return;

				glitchTimeoutId = setTimeout(
					() => {
						if (isCancelled) return;

						isGlitching = true;

						glitchEndTimeoutId = setTimeout(
							() => {
								isGlitching = false;
								startGlitchLoop();
							},
							glitchDuration()
						);
					},
					glitchInterval()
				);
			};

			if (glitchMode()) startGlitchLoop();

			const run = (timestamp) => {
				if (isCancelled) return;

				if (timestamp - lastFrameTime < frameDuration) {
					animationFrameId = window.requestAnimationFrame(run);

					return;
				}

				lastFrameTime = timestamp;
				ctx.clearRect(-fuzzRange() - 20, -fuzzRange() - 10, offscreenWidth + 2 * (fuzzRange() + 20), tightHeight + 2 * (fuzzRange() + 10));

				if (isClicking) {
					targetIntensity = 1;
				} else if (isGlitching) {
					targetIntensity = 1;
				} else if (isHovering) {
					targetIntensity = hoverIntensity();
				} else {
					targetIntensity = baseIntensity();
				}

				if (transitionDuration() > 0) {
					const step = 1 / (transitionDuration() / frameDuration);

					if (currentIntensity < targetIntensity) {
						currentIntensity = Math.min(currentIntensity + step, targetIntensity);
					} else if (currentIntensity > targetIntensity) {
						currentIntensity = Math.max(currentIntensity - step, targetIntensity);
					}
				} else {
					currentIntensity = targetIntensity;
				}

				if (direction() === 'horizontal') {
					for (let j = 0; j < tightHeight; j++) {
						const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange());

						ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
					}
				} else if (direction() === 'vertical') {
					for (let i = 0; i < offscreenWidth; i++) {
						const dy = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange());

						ctx.drawImage(offscreen, i, 0, 1, tightHeight, i, dy, 1, tightHeight);
					}
				} else {
					for (let j = 0; j < tightHeight; j++) {
						const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange());

						ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
					}

					const tempData = ctx.getImageData(0, 0, offscreenWidth + fuzzRange(), tightHeight + fuzzRange());

					ctx.clearRect(-fuzzRange() - 20, -fuzzRange() - 10, offscreenWidth + 2 * (fuzzRange() + 20), tightHeight + 2 * (fuzzRange() + 10));
					ctx.putImageData(tempData, 0, 0);

					for (let i = 0; i < offscreenWidth + fuzzRange(); i++) {
						const dy = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange() * 0.5);
						const colData = ctx.getImageData(i, 0, 1, tightHeight + fuzzRange());

						ctx.clearRect(i, -fuzzRange(), 1, tightHeight + 2 * fuzzRange());
						ctx.putImageData(colData, i, dy);
					}
				}

				animationFrameId = window.requestAnimationFrame(run);
			};

			animationFrameId = window.requestAnimationFrame(run);

			const isInsideTextArea = (x, y) => x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;

			const handleMouseMove = (e) => {
				if (!enableHover()) return;

				const rect = canvas.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				isHovering = isInsideTextArea(x, y);
			};

			const handleMouseLeave = () => {
				isHovering = false;
			};

			const handleClick = () => {
				if (!clickEffect()) return;

				isClicking = true;

				if (clickTimeoutId) clearTimeout(clickTimeoutId);

				clickTimeoutId = setTimeout(
					() => {
						isClicking = false;
					},
					150
				);
			};

			const handleTouchMove = (e) => {
				if (!enableHover()) return;

				e.preventDefault();

				const rect = canvas.getBoundingClientRect();
				const touch = e.touches[0];

				if (!touch) return;

				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;

				isHovering = isInsideTextArea(x, y);
			};

			const handleTouchEnd = () => {
				isHovering = false;
			};

			if (enableHover()) {
				canvas.addEventListener('mousemove', handleMouseMove);
				canvas.addEventListener('mouseleave', handleMouseLeave);
				canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
				canvas.addEventListener('touchend', handleTouchEnd);
			}

			if (clickEffect()) {
				canvas.addEventListener('click', handleClick);
			}

			teardown = () => {
				window.cancelAnimationFrame(animationFrameId);

				if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
				if (glitchEndTimeoutId) clearTimeout(glitchEndTimeoutId);
				if (clickTimeoutId) clearTimeout(clickTimeoutId);

				if (enableHover()) {
					canvas.removeEventListener('mousemove', handleMouseMove);
					canvas.removeEventListener('mouseleave', handleMouseLeave);
					canvas.removeEventListener('touchmove', handleTouchMove);
					canvas.removeEventListener('touchend', handleTouchEnd);
				}

				if (clickEffect()) {
					canvas.removeEventListener('click', handleClick);
				}
			};
		};

		init();

		return () => {
			isCancelled = true;
			window.cancelAnimationFrame(animationFrameId);

			if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
			if (glitchEndTimeoutId) clearTimeout(glitchEndTimeoutId);
			if (clickTimeoutId) clearTimeout(clickTimeoutId);

			teardown?.();
		};
	});

	var canvas_1 = root();

	$.bind_this(canvas_1, ($$value) => $.set(canvasEl, $$value), () => $.get(canvasEl));
	$.template_effect(() => $.set_class(canvas_1, 1, $.clsx(className())));
	$.append($$anchor, canvas_1);
	$.pop();
}