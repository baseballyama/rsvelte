import * as $ from 'svelte/internal/server';

export default function GlareHover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			width = '500px',
			height = '500px',
			background = '#000',
			borderRadius = '10px',
			borderColor = '#333',
			glareColor = '#ffffff',
			glareOpacity = 0.5,
			glareAngle = -45,
			glareSize = 250,
			transitionDuration = 650,
			playOnce = false,
			class: className = '',
			style = ''
		} = $$props;

		const rgba = $.derived(() => {
			const hex = glareColor.replace('#', '');

			if ((/^[\dA-Fa-f]{6}$/).test(hex)) {
				const r = parseInt(hex.slice(0, 2), 16);
				const g = parseInt(hex.slice(2, 4), 16);
				const b = parseInt(hex.slice(4, 6), 16);

				return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
			}

			if ((/^[\dA-Fa-f]{3}$/).test(hex)) {
				const r = parseInt(hex[0] + hex[0], 16);
				const g = parseInt(hex[1] + hex[1], 16);
				const b = parseInt(hex[2] + hex[2], 16);

				return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
			}

			return glareColor;
		});

		let overlay;

		function animateIn() {
			if (!overlay) return;

			overlay.style.transition = 'none';
			overlay.style.backgroundPosition = '-100% -100%, 0 0';

			// force reflow
			void overlay.offsetWidth;

			overlay.style.transition = `${transitionDuration}ms ease`;
			overlay.style.backgroundPosition = '100% 100%, 0 0';
		}

		function animateOut() {
			if (!overlay) return;

			if (playOnce) {
				overlay.style.transition = 'none';
				overlay.style.backgroundPosition = '-100% -100%, 0 0';
			} else {
				overlay.style.transition = `${transitionDuration}ms ease`;
				overlay.style.backgroundPosition = '-100% -100%, 0 0';
			}
		}

		$$renderer.push(`<div${$.attr_class(`relative grid place-items-center overflow-hidden border cursor-pointer ${$.stringify(className)}`)}${$.attr_style(`width:${$.stringify(width)};height:${$.stringify(height)};background:${$.stringify(background)};border-radius:${$.stringify(borderRadius)};border-color:${$.stringify(borderColor)};${$.stringify(style)}`)} role="presentation"><div${$.attr_style(`position:absolute;inset:0;background:linear-gradient(${$.stringify(glareAngle)}deg, hsla(0,0%,0%,0) 60%, ${$.stringify(rgba())} 70%, hsla(0,0%,0%,0) 100%);background-size:${$.stringify(glareSize)}% ${$.stringify(glareSize)}%, 100% 100%;background-repeat:no-repeat;background-position:-100% -100%, 0 0;pointer-events:none;`)}></div> `);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}