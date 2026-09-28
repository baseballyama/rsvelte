import * as $ from 'svelte/internal/server';
import { getVersion } from "@tauri-apps/api/app";
import { onMount } from "svelte";
import { ThemeSwitcher } from "$lib/components";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import { ASCII_ART, APP_INFO } from "$lib/constants";

export default function AppInfo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let version = "";
		let latestVersion = "";
		let showInfo = false;
		let hasUpdate = false;

		async function checkLatestVersion() {
			try {
				const response = await fetch("https://api.github.com/repos/abdenasser/neohtop/releases/latest");
				const data = await response.json();

				// Extract version number from tag (e.g., "1.0.6" from "macos-nightly-1.0.6")
				const versionMatch = data.tag_name.match(/\d+\.\d+\.\d+/);

				if (!versionMatch) {
					console.warn("Unexpected version format in latest release:", data.tag_name);

					return;
				}

				latestVersion = versionMatch[0];

				// Extract version number from current version
				const currentVersionMatch = version.match(/\d+\.\d+\.\d+/);

				if (!currentVersionMatch) {
					console.warn("Unexpected current version format:", version);

					return;
				}

				// Compare only the version numbers
				hasUpdate = currentVersionMatch[0] !== latestVersion;
			} catch(error) {
				console.error("Failed to check latest version:", error);
				latestVersion = "";
				hasUpdate = false;
			}
		}

		onMount(async () => {
			try {
				version = await getVersion();
				await checkLatestVersion();
			} catch(error) {
				console.error("Failed to initialize version info:", error);
				version = "";
			}
		});

		$$renderer.push(`<div class="app-info svelte-w37f43">`);
		ThemeSwitcher($$renderer, {});
		$$renderer.push(`<!----> <button aria-label="Toggle app info"${$.attr_class('svelte-w37f43', void 0, { 'info-button': true, 'has-update': hasUpdate })}><span${$.attr_class('icon svelte-w37f43', void 0, { 'update-available': hasUpdate })}>`);
		Fa($$renderer, { icon: faInfo });
		$$renderer.push(`<!----></span></button> `);

		if (showInfo) {
			$$renderer.push(`<!--[0--><div class="info-panel svelte-w37f43"><div class="info-content svelte-w37f43"><pre class="ascii-art svelte-w37f43">${$.escape(ASCII_ART)}</pre> <div class="details svelte-w37f43"><div class="detail-row svelte-w37f43"><span class="svelte-w37f43">NeoHtop v${$.escape(version)}</span> `);

			if (hasUpdate) {
				$$renderer.push(`<!--[0--><a${$.attr('href', `https://github.com/abdenasser/neohtop/releases/latest`)} class="update-button svelte-w37f43" target="_blank" rel="noopener noreferrer">Update to v${$.escape(latestVersion)}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="detail-row svelte-w37f43"><span class="label svelte-w37f43">app</span> <span class="separator svelte-w37f43">::</span> <span class="value svelte-w37f43">${$.escape(APP_INFO.name)}</span></div> <div class="detail-row svelte-w37f43"><span class="label svelte-w37f43">source</span> <span class="separator svelte-w37f43">::</span> <a${$.attr('href', APP_INFO.github)} class="value svelte-w37f43" target="_blank" rel="noopener noreferrer">${$.escape(APP_INFO.github)}</a></div> <div class="detail-row svelte-w37f43"><span class="label svelte-w37f43">stack</span> <span class="separator svelte-w37f43">::</span> <span class="value svelte-w37f43">${$.escape(APP_INFO.stack.join(", "))}</span></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}