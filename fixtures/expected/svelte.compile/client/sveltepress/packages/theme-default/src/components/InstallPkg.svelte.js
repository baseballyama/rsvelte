import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function InstallPkg($$anchor, $$props) {
	/**
	 * @typedef {object} Props
	 * @property {import('svelte').Snippet} [npm] - NPM snippet
	 * @property {import('svelte').Snippet} [yarn] - Yarn snippet
	 * @property {import('svelte').Snippet} [pnpm] - PNPM snippet
	 * @property {import('svelte').Snippet} [bun] - Bun snippet
	 */
	/** @type {Props} */ (
	Tabs)($$anchor, {
		activeName: 'NPM',
		bodyPadding: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TabPanel(node, {
				name: 'NPM',
				get activeIcon() {
					return NpmWithColor;
				},

				get inactiveIcon() {
					return Npm;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.npm ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			TabPanel(node_2, {
				name: 'YARN',
				get activeIcon() {
					return YarnWithColor;
				},

				get inactiveIcon() {
					return Yarn;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.snippet(node_3, () => $$props.yarn ?? $.noop);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			TabPanel(node_4, {
				name: 'PNPM',
				get activeIcon() {
					return PnpmWithColor;
				},

				get inactiveIcon() {
					return Pnpm;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					$.snippet(node_5, () => $$props.pnpm ?? $.noop);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			TabPanel(node_6, {
				name: 'BUN',
				get activeIcon() {
					return BunWithColor;
				},

				get inactiveIcon() {
					return Bun;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_7 = $.first_child(fragment_5);

					$.snippet(node_7, () => $$props.bun ?? $.noop);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}