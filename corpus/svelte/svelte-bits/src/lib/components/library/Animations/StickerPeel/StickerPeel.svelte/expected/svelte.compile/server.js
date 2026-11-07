import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

export default function StickerPeel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		gsap.registerPlugin(Draggable);

		let {
			imageSrc,
			rotate = 30,
			peelBackHoverPct = 30,
			peelBackActivePct = 40,
			peelEasing = 'power3.out',
			peelHoverEasing = 'power2.out',
			width = 200,
			shadowIntensity = 0.6,
			lightingIntensity = 0.1,
			initialPosition = 'center',
			peelDirection = 0,
			class: className = ''
		} = $$props;

		const padding = 12;
		let dragTarget;
		let container;
		let pointLight;
		let pointLightFlipped;
		const cssVars = $.derived(() => `--sticker-rotate:${rotate}deg;--sticker-p:${padding}px;--sticker-peelback-hover:${peelBackHoverPct}%;--sticker-peelback-active:${peelBackActivePct}%;--sticker-peel-easing:${peelEasing};--sticker-peel-hover-easing:${peelHoverEasing};--sticker-width:${width}px;--sticker-shadow-opacity:${shadowIntensity};--sticker-lighting-constant:${lightingIntensity};--peel-direction:${peelDirection}deg;--sticker-start:calc(-1 * ${padding}px);--sticker-end:calc(100% + ${padding}px);`);
		const stickerMainStyle = 'clip-path:polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end));transition:clip-path 0.6s ease-out;filter:url(#dropShadow);will-change:clip-path,transform;';
		const flapStyle = 'clip-path:polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-start) var(--sticker-start));top:calc(-100% - var(--sticker-p) - var(--sticker-p));transform:scaleY(-1);transition:all 0.6s ease-out;will-change:clip-path,transform;';
		const imageStyle = $.derived(() => `transform:rotate(calc(${rotate}deg - ${peelDirection}deg));width:${width}px;`);
		const shadowImageStyle = $.derived(() => `${imageStyle()}filter:url(#expandAndFill);`);

		$$renderer.push(`<div${$.attr_class(`absolute cursor-grab active:cursor-grabbing transform-gpu ${$.stringify(className)}`)}${$.attr_style(cssVars())}><svg width="0" height="0"><defs><filter id="pointLight"><feGaussianBlur stdDeviation="1" result="blur"></feGaussianBlur><feSpecularLighting result="spec" in="blur" specularExponent="100"${$.attr('specularConstant', lightingIntensity)} lighting-color="white"><fePointLight x="100" y="100" z="300"></fePointLight></feSpecularLighting><feComposite in="spec" in2="SourceGraphic" result="lit"></feComposite><feComposite in="lit" in2="SourceAlpha" operator="in"></feComposite></filter><filter id="pointLightFlipped"><feGaussianBlur stdDeviation="10" result="blur"></feGaussianBlur><feSpecularLighting result="spec" in="blur" specularExponent="100"${$.attr('specularConstant', lightingIntensity * 7)} lighting-color="white"><fePointLight x="100" y="100" z="300"></fePointLight></feSpecularLighting><feComposite in="spec" in2="SourceGraphic" result="lit"></feComposite><feComposite in="lit" in2="SourceAlpha" operator="in"></feComposite></filter><filter id="dropShadow"><feDropShadow dx="2" dy="4"${$.attr('stdDeviation', 3 * shadowIntensity)} flood-color="black"${$.attr('flood-opacity', shadowIntensity)}></feDropShadow></filter><filter id="expandAndFill"><feOffset dx="0" dy="0" in="SourceAlpha" result="shape"></feOffset><feFlood flood-color="rgb(179,179,179)" result="flood"></feFlood><feComposite operator="in" in="flood" in2="shape"></feComposite></filter></defs></svg> <div class="sticker-container relative select-none touch-none sm:touch-auto"${$.attr_style(`-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;transform:rotate(${$.stringify(peelDirection)}deg);transform-origin:center;`)}><div class="sticker-main"${$.attr_style(stickerMainStyle)}><div style="filter:url(#pointLight);"><img${$.attr('src', imageSrc)} alt="" class="block"${$.attr_style(imageStyle())} draggable="false"/></div></div> <div class="absolute top-4 left-2 w-full h-full opacity-40" style="filter:brightness(0) blur(8px);"><div class="sticker-flap"${$.attr_style(flapStyle)}><img${$.attr('src', imageSrc)} alt="" class="block"${$.attr_style(shadowImageStyle())} draggable="false"/></div></div> <div class="sticker-flap absolute w-full h-full left-0"${$.attr_style(flapStyle)}><div style="filter:url(#pointLightFlipped);"><img${$.attr('src', imageSrc)} alt="" class="block"${$.attr_style(shadowImageStyle())} draggable="false"/></div></div></div></div>`);
	});
}