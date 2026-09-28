import * as $ from 'svelte/internal/server';
import { useCamera } from './utils/useCamera.svelte.js';

export default function Camera($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref,
			manual = false,
			makeDefault = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		useCamera(() => ref, () => manual, () => makeDefault, () => rest);
	});
}