import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { PositionalAudio } from 'three';
import { useAudio } from '../utils/useAudio.svelte.js';
import { useThrelteAudio } from '../useThrelteAudio.js';

export default function PositionalAudio_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			src,
			autoplay = false,
			loop = false,
			volume = 1,
			playbackRate = 1,
			detune = 0,
			directionalCone,
			refDistance,
			rolloffFactor,
			distanceModel,
			maxDistance,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const { getAudioListener } = useThrelteAudio();
		const listener = $.derived(() => getAudioListener(id));
		const audio = $.derived(() => listener() ? new PositionalAudio(listener()) : undefined);
		const { pause, play, stop } = useAudio(() => audio(), () => src, () => autoplay, () => loop, () => volume, () => playbackRate, () => detune, () => rest);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (audio()) {
				$$renderer.push('<!--[0-->');

				T($$renderer, $.spread_props([
					{ is: audio() },
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer, { ref: audio() });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, pause, play, stop });
	});
}