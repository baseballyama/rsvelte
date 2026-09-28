import * as $ from 'svelte/internal/server';
import { PauseIcon, PlayIcon } from './icons';

export default function Controller($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { position = void 0, playing, play, pause, rate = 1 } = $$props;
		const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

		const toggleRate = () => {
			if (rate == 1) {
				rate = 0.5;
			} else if (rate == 0.5) {
				rate = 2;
			} else {
				rate = 1;
			}
		};

		$$renderer.push(`<menu class="svelte-1og7xza">`);

		if (!playing) {
			$$renderer.push(`<!--[0--><button>`);
			PlayIcon($$renderer, {});
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><button>`);
			PauseIcon($$renderer, {});
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]--> <button>x${$.escape(rate.toFixed(1))}</button> <input type="range"${$.attr('min', 0)}${$.attr('max', 1)}${$.attr('step', 0.01)}${$.attr('value', position)} class="svelte-1og7xza"/> <div class="svelte-1og7xza">${$.escape(fmt(position))}</div></menu>`);
		$.bind_props($$props, { position, rate });
	});
}