import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { AudioListener } from 'three';
import { useThrelteAudio } from '../useThrelteAudio.js';
import { acquireAutoResume } from './autoResume.js';
import { untrack } from 'svelte';

export default function AudioListener_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			masterVolume,
			autoResume,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const listener = new AudioListener();
		const audioContext = listener.context;
		const resumeContext = () => listener.context.resume();
		const { addAudioListener, removeAudioListener } = useThrelteAudio();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: listener },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: listener });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, audioContext, resumeContext });
	});
}