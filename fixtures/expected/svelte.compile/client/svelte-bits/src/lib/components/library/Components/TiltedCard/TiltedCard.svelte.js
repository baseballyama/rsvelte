import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { motionValue, animate } from 'motion';

var root = $.from_html(`<div class="absolute top-4 text-center text-sm block sm:hidden">This effect is not optimized for mobile. Check on desktop.</div>`);
var root_1 = $.from_html(`<div class="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]"><!></div>`);
var root_2 = $.from_html(`<figcaption class="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] z-[3] hidden sm:block"> </figcaption>`);
var root_3 = $.from_html(`<figure role="figure" class="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"><!> <div class="relative [transform-style:preserve-3d]"><img class="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"/> <!></div> <!></figure>`);

export default function TiltedCard($$anchor, $$props) {
	$.push($$props, true);

	let altText = $.prop($$props, 'altText', 3, 'Tilted card image'),
		captionText = $.prop($$props, 'captionText', 3, ''),
		containerHeight = $.prop($$props, 'containerHeight', 3, '300px'),
		containerWidth = $.prop($$props, 'containerWidth', 3, '100%'),
		imageHeight = $.prop($$props, 'imageHeight', 3, '300px'),
		imageWidth = $.prop($$props, 'imageWidth', 3, '300px'),
		scaleOnHover = $.prop($$props, 'scaleOnHover', 3, 1.1),
		rotateAmplitude = $.prop($$props, 'rotateAmplitude', 3, 14),
		showMobileWarning = $.prop($$props, 'showMobileWarning', 3, true),
		showTooltip = $.prop($$props, 'showTooltip', 3, true),
		displayOverlayContent = $.prop($$props, 'displayOverlayContent', 3, false);

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
	let xv = $.state(0);
	let yv = $.state(0);
	let rxv = $.state(0);
	let ryv = $.state(0);
	let scaleV = $.state(1);
	let opacityV = $.state(0);
	let rotCapV = $.state(0);

	mvX.on('change', (v) => $.set(xv, v, true));
	mvY.on('change', (v) => $.set(yv, v, true));
	mvRX.on('change', (v) => $.set(rxv, v, true));
	mvRY.on('change', (v) => $.set(ryv, v, true));
	mvScale.on('change', (v) => $.set(scaleV, v, true));
	mvOpacity.on('change', (v) => $.set(opacityV, v, true));
	mvRotCap.on('change', (v) => $.set(rotCapV, v, true));

	function handleMouse(e) {
		if (!figureRef) return;

		const rect = figureRef.getBoundingClientRect();
		const offsetX = e.clientX - rect.left - rect.width / 2;
		const offsetY = e.clientY - rect.top - rect.height / 2;
		const rotationX = offsetY / (rect.height / 2) * -rotateAmplitude();
		const rotationY = offsetX / (rect.width / 2) * rotateAmplitude();

		animate(mvRX, rotationX, SPRING);
		animate(mvRY, rotationY, SPRING);
		mvX.set(e.clientX - rect.left);
		mvY.set(e.clientY - rect.top);

		const velocityY = offsetY - lastY;

		animate(mvRotCap, -velocityY * 0.6, TIP_SPRING);
		lastY = offsetY;
	}

	function handleEnter() {
		animate(mvScale, scaleOnHover(), SPRING);
		animate(mvOpacity, 1, SPRING);
	}

	function handleLeave() {
		animate(mvOpacity, 0, SPRING);
		animate(mvScale, 1, SPRING);
		animate(mvRX, 0, SPRING);
		animate(mvRY, 0, SPRING);
		animate(mvRotCap, 0, TIP_SPRING);
	}

	var figure = root_3();
	var node = $.child(figure);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (showMobileWarning()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var img = $.child(div_1);
	var node_1 = $.sibling(img, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var node_2 = $.child(div_2);

			$.snippet(node_2, () => $$props.overlayContent);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (displayOverlayContent() && $$props.overlayContent) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var figcaption = root_2();
			var text = $.only_child(figcaption, true);

			$.template_effect(() => {
				$.set_style(figcaption, `transform:translate(${$.get(xv) ?? ''}px,${$.get(yv) ?? ''}px) rotate(${$.get(rotCapV) ?? ''}deg);opacity:${$.get(opacityV) ?? ''};`);
				$.set_text(text, captionText());
			});

			$.append($$anchor, figcaption);
		};

		$.if(node_3, ($$render) => {
			if (showTooltip()) $$render(consequent_2);
		});
	}

	$.reset(figure);
	$.bind_this(figure, ($$value) => figureRef = $$value, () => figureRef);

	$.template_effect(() => {
		$.set_style(figure, `height:${containerHeight() ?? ''};width:${containerWidth() ?? ''};`);
		$.set_style(div_1, `width:${imageWidth() ?? ''};height:${imageHeight() ?? ''};transform:rotateX(${$.get(rxv) ?? ''}deg) rotateY(${$.get(ryv) ?? ''}deg) scale(${$.get(scaleV) ?? ''});`);
		$.set_attribute(img, 'src', $$props.imageSrc);
		$.set_attribute(img, 'alt', altText());
		$.set_style(img, `width:${imageWidth() ?? ''};height:${imageHeight() ?? ''};`);
	});

	$.delegated('mousemove', figure, handleMouse);
	$.event('mouseenter', figure, handleEnter);
	$.event('mouseleave', figure, handleLeave);
	$.append($$anchor, figure);
	$.pop();
}

$.delegate(['mousemove']);