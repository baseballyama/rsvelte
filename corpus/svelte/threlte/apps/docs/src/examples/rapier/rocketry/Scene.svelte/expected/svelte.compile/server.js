import * as $ from 'svelte/internal/server';
import { PortalTarget, Stars } from '@threlte/extras';
import Level from './Level.svelte';
import { level1, level2 } from './levels/levels';
import { useThrelte } from '@threlte/core';
import { Color } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const levels = [level1, level2];
		let currentLevelIndex = 0;
		const level = $.derived(() => levels[currentLevelIndex]);

		const nextLevel = () => {
			if (currentLevelIndex < levels.length - 1) {
				currentLevelIndex += 1;
			}
		};

		const { scene } = useThrelte();

		scene.background = new Color('black');
		PortalTarget($$renderer, { id: 'scene' });
		$$renderer.push(`<!----> <!---->`);

		{
			if (level()) {
				$$renderer.push('<!--[0-->');
				Level($$renderer, { level: level(), levelcomplete: nextLevel });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!----> `);
		Stars($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}