import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useThrelte } from '@threlte/core';
import { useSuspense } from '@threlte/extras';
import { fromStore } from 'svelte/store';

export default function BakeShadows($$anchor, $$props) {
	$.push($$props, true);

	const suspended = fromStore(useSuspense().suspended);
	const { renderer } = useThrelte();

	$.user_pre_effect(() => {
		if (suspended.current) {
			return;
		}

		const { autoUpdate } = renderer.shadowMap;

		renderer.shadowMap.autoUpdate = false;
		renderer.shadowMap.needsUpdate = true;

		return () => {
			renderer.shadowMap.autoUpdate = autoUpdate;
			renderer.shadowMap.needsUpdate = true;
		};
	});

	$.pop();
}