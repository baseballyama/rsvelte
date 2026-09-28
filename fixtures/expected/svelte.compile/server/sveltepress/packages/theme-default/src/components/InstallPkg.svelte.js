import * as $ from 'svelte/internal/server';
import Bun from './icons/logos/Bun.svelte';
import BunWithColor from './icons/logos/BunWithColor.svelte';
import Npm from './icons/logos/Npm.svelte';
import NpmWithColor from './icons/logos/NpmWithColor.svelte';
import Pnpm from './icons/logos/Pnpm.svelte';
import PnpmWithColor from './icons/logos/PnpmWithColor.svelte';
import Yarn from './icons/logos/Yarn.svelte';
import YarnWithColor from './icons/logos/YarnWithColor.svelte';
import TabPanel from './TabPanel.svelte';
import Tabs from './Tabs.svelte';

export default function InstallPkg($$renderer, $$props) {
	/**
	 * @typedef {object} Props
	 * @property {import('svelte').Snippet} [npm] - NPM snippet
	 * @property {import('svelte').Snippet} [yarn] - Yarn snippet
	 * @property {import('svelte').Snippet} [pnpm] - PNPM snippet
	 * @property {import('svelte').Snippet} [bun] - Bun snippet
	 */
	/** @type {Props} */
	const { npm, yarn, pnpm, bun } = $$props;

	Tabs($$renderer, {
		activeName: 'NPM',
		bodyPadding: false,
		children: ($$renderer) => {
			TabPanel($$renderer, {
				name: 'NPM',
				activeIcon: NpmWithColor,
				inactiveIcon: Npm,
				children: ($$renderer) => {
					npm?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabPanel($$renderer, {
				name: 'YARN',
				activeIcon: YarnWithColor,
				inactiveIcon: Yarn,
				children: ($$renderer) => {
					yarn?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabPanel($$renderer, {
				name: 'PNPM',
				activeIcon: PnpmWithColor,
				inactiveIcon: Pnpm,
				children: ($$renderer) => {
					pnpm?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabPanel($$renderer, {
				name: 'BUN',
				activeIcon: BunWithColor,
				inactiveIcon: Bun,
				children: ($$renderer) => {
					bun?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}