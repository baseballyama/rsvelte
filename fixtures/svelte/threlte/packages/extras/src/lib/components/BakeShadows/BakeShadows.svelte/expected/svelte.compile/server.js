import * as $ from 'svelte/internal/server';
import { useThrelte } from '@threlte/core';
import { useSuspense } from '@threlte/extras';
import { fromStore } from 'svelte/store';

export default function BakeShadows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const suspended = fromStore(useSuspense().suspended);
		const { renderer } = useThrelte();
	});
}