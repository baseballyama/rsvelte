import * as $ from 'svelte/internal/server';
import { motionValue, animate } from 'motion';

export default function TiltedCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			imageSrc,
			altText = 'Tilted card image',
			captionText = '',
			containerHeight = '300px',
			containerWidth = '100%',
			imageHeight = '300px',
			imageWidth = '300px',
			scaleOnHover = 1.1,
			rotateAmplitude = 14,
			showMobileWarning = true,
			showTooltip = true,
			overlayContent,
			displayOverlayContent = false
		} = $$props;

		let figureRef;
		let lastY = 0;
		const SPRING = { type: 'spring', stiffness: 100, damping: 30, mass: 2 };
		const TIP_SPRING = { type: 'spring', stiffness: 350, damping: 30, mass: 1 };
		const mvX = motionValue(0);
		const mvY = motionValue(0);
		const mvRX = motionValue(0);
		const mvRY = motionValue(0);
		const mvScale = motionValue(1);
		const mvOpacity = motionValue(0);
		const mvRotCap = motionValue(0);
		let xv = 0;
		let yv = 0;
		let rxv = 0;
		let ryv = 0;
		let scaleV = 1;
		let opacityV = 0;
		let rotCapV = 0;

		mvX.on('change', (v) => xv = v);
		mvY.on('change', (v) => yv = v);
		mvRX.on('change', (v) => rxv = v);
		mvRY.on('change', (v) => ryv = v);
		mvScale.on('change', (v) => scaleV = v);
		mvOpacity.on('change', (v) => opacityV = v);
		mvRotCap.on('change', (v) => rotCapV = v);

		function handleMouse(e) {
			if (!figureRef) return;

			const rect = figureRef.getBoundingClientRect();
			const offsetX = e.clientX - rect.left - rect.width / 2;
			const offsetY = e.clientY - rect.top - rect.height / 2;
			const rotationX = offsetY / (rect.height / 2) * -rotateAmplitude;
			const rotationY = offsetX / (rect.width / 2) * rotateAmplitude;

			animate(mvRX, rotationX, SPRING);
			animate(mvRY, rotationY, SPRING);
			mvX.set(e.clientX - rect.left);
			mvY.set(e.clientY - rect.top);

			const velocityY = offsetY - lastY;

			animate(mvRotCap, -velocityY * 0.6, TIP_SPRING);
			lastY = offsetY;
		}

		function handleEnter() {
			animate(mvScale, scaleOnHover, SPRING);
			animate(mvOpacity, 1, SPRING);
		}

		function handleLeave() {
			animate(mvOpacity, 0, SPRING);
			animate(mvScale, 1, SPRING);
			animate(mvRX, 0, SPRING);
			animate(mvRY, 0, SPRING);
			animate(mvRotCap, 0, TIP_SPRING);
		}

		$$renderer.push(`<figure role="figure" class="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"${$.attr_style(`height:${$.stringify(containerHeight)};width:${$.stringify(containerWidth)};`)}>`);

		if (showMobileWarning) {
			$$renderer.push(`<!--[0--><div class="absolute top-4 text-center text-sm block sm:hidden">This effect is not optimized for mobile. Check on desktop.</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="relative [transform-style:preserve-3d]"${$.attr_style(`width:${$.stringify(imageWidth)};height:${$.stringify(imageHeight)};transform:rotateX(${$.stringify(rxv)}deg) rotateY(${$.stringify(ryv)}deg) scale(${$.stringify(scaleV)});`)}><img${$.attr('src', imageSrc)}${$.attr('alt', altText)} class="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"${$.attr_style(`width:${$.stringify(imageWidth)};height:${$.stringify(imageHeight)};`)}/> `);

		if (displayOverlayContent && overlayContent) {
			$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]">`);
			overlayContent($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (showTooltip) {
			$$renderer.push(`<!--[0--><figcaption class="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] z-[3] hidden sm:block"${$.attr_style(`transform:translate(${$.stringify(xv)}px,${$.stringify(yv)}px) rotate(${$.stringify(rotCapV)}deg);opacity:${$.stringify(opacityV)};`)}>${$.escape(captionText)}</figcaption>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></figure>`);
	});
}