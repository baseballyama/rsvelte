import * as $ from 'svelte/internal/server';

export default function FuzzyText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text = '',
			fontSize = 'clamp(2rem, 10vw, 10rem)',
			fontWeight = 900,
			fontFamily = 'inherit',
			color = '#fff',
			enableHover = true,
			baseIntensity = 0.18,
			hoverIntensity = 0.5,
			fuzzRange = 30,
			fps = 60,
			direction = 'horizontal',
			transitionDuration = 0,
			clickEffect = false,
			glitchMode = false,
			glitchInterval = 2000,
			glitchDuration = 200,
			gradient = null,
			letterSpacing = 0,
			class: className = ''
		} = $$props;

		let canvasEl = void 0;

		$$renderer.push(`<canvas${$.attr_class($.clsx(className))}></canvas>`);
	});
}