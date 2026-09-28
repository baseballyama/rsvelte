import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

var root = $.from_html(`<div><svg width="0" height="0"><defs><filter id="pointLight"><feGaussianBlur stdDeviation="1" result="blur"></feGaussianBlur><feSpecularLighting result="spec" in="blur" specularExponent="100" lighting-color="white"><fePointLight x="100" y="100" z="300"></fePointLight></feSpecularLighting><feComposite in="spec" in2="SourceGraphic" result="lit"></feComposite><feComposite in="lit" in2="SourceAlpha" operator="in"></feComposite></filter><filter id="pointLightFlipped"><feGaussianBlur stdDeviation="10" result="blur"></feGaussianBlur><feSpecularLighting result="spec" in="blur" specularExponent="100" lighting-color="white"><fePointLight x="100" y="100" z="300"></fePointLight></feSpecularLighting><feComposite in="spec" in2="SourceGraphic" result="lit"></feComposite><feComposite in="lit" in2="SourceAlpha" operator="in"></feComposite></filter><filter id="dropShadow"><feDropShadow dx="2" dy="4" flood-color="black"></feDropShadow></filter><filter id="expandAndFill"><feOffset dx="0" dy="0" in="SourceAlpha" result="shape"></feOffset><feFlood flood-color="rgb(179,179,179)" result="flood"></feFlood><feComposite operator="in" in="flood" in2="shape"></feComposite></filter></defs></svg> <div class="sticker-container relative select-none touch-none sm:touch-auto"><div class="sticker-main"><div style="filter:url(#pointLight);"><img alt="" class="block" draggable="false"/></div></div> <div class="absolute top-4 left-2 w-full h-full opacity-40" style="filter:brightness(0) blur(8px);"><div class="sticker-flap"><img alt="" class="block" draggable="false"/></div></div> <div class="sticker-flap absolute w-full h-full left-0"><div style="filter:url(#pointLightFlipped);"><img alt="" class="block" draggable="false"/></div></div></div></div>`);

export default function StickerPeel($$anchor, $$props) {
	$.push($$props, true);
	gsap.registerPlugin(Draggable);

	let rotate = $.prop($$props, 'rotate', 3, 30),
		peelBackHoverPct = $.prop($$props, 'peelBackHoverPct', 3, 30),
		peelBackActivePct = $.prop($$props, 'peelBackActivePct', 3, 40),
		peelEasing = $.prop($$props, 'peelEasing', 3, 'power3.out'),
		peelHoverEasing = $.prop($$props, 'peelHoverEasing', 3, 'power2.out'),
		width = $.prop($$props, 'width', 3, 200),
		shadowIntensity = $.prop($$props, 'shadowIntensity', 3, 0.6),
		lightingIntensity = $.prop($$props, 'lightingIntensity', 3, 0.1),
		initialPosition = $.prop($$props, 'initialPosition', 3, 'center'),
		peelDirection = $.prop($$props, 'peelDirection', 3, 0),
		className = $.prop($$props, 'class', 3, '');

	const padding = 12;
	let dragTarget;
	let container;
	let pointLight;
	let pointLightFlipped;

	$.user_effect(() => {
		if (!dragTarget) return;

		if (typeof initialPosition() === 'object') {
			gsap.set(dragTarget, { x: initialPosition().x, y: initialPosition().y });
		}
	});

	$.user_effect(() => {
		if (!dragTarget) return;

		const boundsEl = dragTarget.parentNode;

		const draggable = Draggable.create(dragTarget, {
			type: 'x,y',
			bounds: boundsEl,
			inertia: true,
			onDrag() {
				const rot = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);

				gsap.to(dragTarget, { rotation: rot, duration: 0.15, ease: 'power1.out' });
			},

			onDragEnd() {
				gsap.to(dragTarget, { rotation: 0, duration: 0.8, ease: 'power2.out' });
			}
		})[0];

		const onResize = () => {
			draggable.update();

			const cx = gsap.getProperty(dragTarget, 'x');
			const cy = gsap.getProperty(dragTarget, 'y');
			const br = boundsEl.getBoundingClientRect();
			const tr = dragTarget.getBoundingClientRect();
			const nx = Math.max(0, Math.min(cx, br.width - tr.width));
			const ny = Math.max(0, Math.min(cy, br.height - tr.height));

			if (nx !== cx || ny !== cy) gsap.to(dragTarget, { x: nx, y: ny, duration: 0.3, ease: 'power2.out' });
		};

		window.addEventListener('resize', onResize);
		window.addEventListener('orientationchange', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('orientationchange', onResize);
			draggable.kill();
		};
	});

	$.user_effect(() => {
		if (!container) return;

		const updateLight = (e) => {
			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			if (pointLight) gsap.set(pointLight, { attr: { x, y } });

			const norm = Math.abs(peelDirection() % 360);

			if (pointLightFlipped) {
				if (norm !== 180) gsap.set(pointLightFlipped, { attr: { x, y: rect.height - y } }); else gsap.set(pointLightFlipped, { attr: { x: -1000, y: -1000 } });
			}
		};

		container.addEventListener('mousemove', updateLight);

		const ts = () => container.classList.add('touch-active');
		const te = () => container.classList.remove('touch-active');

		container.addEventListener('touchstart', ts);
		container.addEventListener('touchend', te);
		container.addEventListener('touchcancel', te);

		return () => {
			container.removeEventListener('mousemove', updateLight);
			container.removeEventListener('touchstart', ts);
			container.removeEventListener('touchend', te);
			container.removeEventListener('touchcancel', te);
		};
	});

	const cssVars = $.derived(() => `--sticker-rotate:${rotate()}deg;--sticker-p:${padding}px;--sticker-peelback-hover:${peelBackHoverPct()}%;--sticker-peelback-active:${peelBackActivePct()}%;--sticker-peel-easing:${peelEasing()};--sticker-peel-hover-easing:${peelHoverEasing()};--sticker-width:${width()}px;--sticker-shadow-opacity:${shadowIntensity()};--sticker-lighting-constant:${lightingIntensity()};--peel-direction:${peelDirection()}deg;--sticker-start:calc(-1 * ${padding}px);--sticker-end:calc(100% + ${padding}px);`);
	const stickerMainStyle = 'clip-path:polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end));transition:clip-path 0.6s ease-out;filter:url(#dropShadow);will-change:clip-path,transform;';
	const flapStyle = 'clip-path:polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-start) var(--sticker-start));top:calc(-100% - var(--sticker-p) - var(--sticker-p));transform:scaleY(-1);transition:all 0.6s ease-out;will-change:clip-path,transform;';
	const imageStyle = $.derived(() => `transform:rotate(calc(${rotate()}deg - ${peelDirection()}deg));width:${width()}px;`);
	const shadowImageStyle = $.derived(() => `${$.get(imageStyle)}filter:url(#expandAndFill);`);
	var div = root();
	var svg = $.child(div);
	var defs = $.child(svg);
	var filter = $.child(defs);
	var feSpecularLighting = $.sibling($.child(filter));
	var fePointLight = $.child(feSpecularLighting);

	$.bind_this(fePointLight, ($$value) => pointLight = $$value, () => pointLight);
	$.reset(feSpecularLighting);
	$.next(2);
	$.reset(filter);

	var filter_1 = $.sibling(filter);
	var feSpecularLighting_1 = $.sibling($.child(filter_1));
	var fePointLight_1 = $.child(feSpecularLighting_1);

	$.bind_this(fePointLight_1, ($$value) => pointLightFlipped = $$value, () => pointLightFlipped);
	$.reset(feSpecularLighting_1);
	$.next(2);
	$.reset(filter_1);

	var filter_2 = $.sibling(filter_1);
	var feDropShadow = $.only_child(filter_2);

	$.next();
	$.reset(defs);
	$.reset(svg);

	var div_1 = $.sibling(svg, 2);
	var div_2 = $.child(div_1);

	$.set_style(div_2, stickerMainStyle);

	var div_3 = $.child(div_2);
	var img = $.only_child(div_3);

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);

	$.set_style(div_5, flapStyle);

	var img_1 = $.only_child(div_5);

	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);

	$.set_style(div_6, flapStyle);

	var div_7 = $.child(div_6);
	var img_2 = $.only_child(div_7);

	$.reset(div_6);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => container = $$value, () => container);
	$.reset(div);
	$.bind_this(div, ($$value) => dragTarget = $$value, () => dragTarget);

	$.template_effect(() => {
		$.set_class(div, 1, `absolute cursor-grab active:cursor-grabbing transform-gpu ${className() ?? ''}`);
		$.set_style(div, $.get(cssVars));
		$.set_attribute(feSpecularLighting, 'specularConstant', lightingIntensity());
		$.set_attribute(feSpecularLighting_1, 'specularConstant', lightingIntensity() * 7);
		$.set_attribute(feDropShadow, 'stdDeviation', 3 * shadowIntensity());
		$.set_attribute(feDropShadow, 'flood-opacity', shadowIntensity());
		$.set_style(div_1, `-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;transform:rotate(${peelDirection() ?? ''}deg);transform-origin:center;`);
		$.set_attribute(img, 'src', $$props.imageSrc);
		$.set_style(img, $.get(imageStyle));
		$.set_attribute(img_1, 'src', $$props.imageSrc);
		$.set_style(img_1, $.get(shadowImageStyle));
		$.set_attribute(img_2, 'src', $$props.imageSrc);
		$.set_style(img_2, $.get(shadowImageStyle));
	});

	$.delegated('contextmenu', img, (e) => e.preventDefault());
	$.delegated('contextmenu', img_1, (e) => e.preventDefault());
	$.delegated('contextmenu', img_2, (e) => e.preventDefault());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['contextmenu']);