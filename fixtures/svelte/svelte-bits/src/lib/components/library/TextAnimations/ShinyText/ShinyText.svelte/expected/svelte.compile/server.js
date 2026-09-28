import * as $ from 'svelte/internal/server';

export default function ShinyText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			disabled = false,
			speed = 2,
			class: className = '',
			color = '#b5b5b5',
			shineColor = '#ffffff',
			spread = 120,
			yoyo = false,
			pauseOnHover = false,
			direction = 'left',
			delay = 0
		} = $$props;

		let progress = direction === 'left' ? 0 : 100;
		let isPaused = false;

		// reset on direction change
		const backgroundImage = $.derived(() => `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`);

		const backgroundPosition = $.derived(() => `${150 - progress * 2}% center`);

		$$renderer.push(`<span${$.attr_class(`inline-block ${$.stringify(className)}`)} role="presentation"${$.attr_style('', {
			'background-image': backgroundImage(),
			'background-size': '200% auto',
			'background-position': backgroundPosition(),
			'-webkit-background-clip': 'text',
			'background-clip': 'text',
			'-webkit-text-fill-color': 'transparent'
		})}>${$.escape(text)}</span>`);
	});
}