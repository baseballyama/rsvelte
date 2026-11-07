import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getVersion } from "@tauri-apps/api/app";
import { onMount } from "svelte";
import { ThemeSwitcher } from "$lib/components";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";
import { ASCII_ART, APP_INFO } from "$lib/constants";

var root = $.from_html(`<a class="update-button svelte-w37f43" target="_blank" rel="noopener noreferrer"> </a>`);
var root_1 = $.from_html(`<div class="info-panel svelte-w37f43"><div class="info-content svelte-w37f43"><pre class="ascii-art svelte-w37f43"> </pre> <div class="details svelte-w37f43"><div class="detail-row svelte-w37f43"><span class="svelte-w37f43"> </span> <!></div> <div class="detail-row svelte-w37f43"><span class="label svelte-w37f43">app</span> <span class="separator svelte-w37f43">::</span> <span class="value svelte-w37f43"> </span></div> <div class="detail-row svelte-w37f43"><span class="label svelte-w37f43">source</span> <span class="separator svelte-w37f43">::</span> <a class="value svelte-w37f43" target="_blank" rel="noopener noreferrer"> </a></div> <div class="detail-row svelte-w37f43"><span class="label svelte-w37f43">stack</span> <span class="separator svelte-w37f43">::</span> <span class="value svelte-w37f43"> </span></div></div></div></div>`);
var root_2 = $.from_html(`<div class="app-info svelte-w37f43"><!> <button aria-label="Toggle app info"><span><!></span></button> <!></div>`);

export default function AppInfo($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_2();
	var node = $.child(div);

	ThemeSwitcher(node, {});

	var button = $.sibling(node, 2);
	let classes;
	var span = $.child(button);
	let classes_1;
	var node_1 = $.child(span);

	Fa(node_1, {
		get icon() {
			return faInfo;
		}
	});

	$.reset(span);
	$.reset(button);

	var node_2 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var pre = $.child(div_2);
			var text = $.only_child(pre, true);
			var div_3 = $.sibling(pre, 2);
			var div_4 = $.child(div_3);
			var span_1 = $.child(div_4);
			var text_1 = $.only_child(span_1);
			var node_3 = $.sibling(span_1, 2);

			{
				var consequent = ($$anchor) => {
					var a = root();

					$.set_attribute(a, 'href', `https://github.com/abdenasser/neohtop/releases/latest`);

					var text_2 = $.only_child(a);

					$.template_effect(() => $.set_text(text_2, `Update to v${latestVersion ?? ''}`));
					$.append($$anchor, a);
				};

				$.if(node_3, ($$render) => {
					if (hasUpdate) $$render(consequent);
				});
			}

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var span_2 = $.sibling($.child(div_5), 4);
			var text_3 = $.only_child(span_2, true);

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var a_1 = $.sibling($.child(div_6), 4);
			var text_4 = $.only_child(a_1, true);

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var span_3 = $.sibling($.child(div_7), 4);
			var text_5 = $.only_child(span_3, true);

			$.reset(div_7);
			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_text(text, ASCII_ART);
					$.set_text(text_1, `NeoHtop v${version ?? ''}`);
					$.set_text(text_3, APP_INFO.name);
					$.set_attribute(a_1, 'href', APP_INFO.github);
					$.set_text(text_4, APP_INFO.github);
					$.set_text(text_5, $0);
				},
				[() => APP_INFO.stack.join(", ")]
			);

			$.event('mouseleave', div_1, () => showInfo = false);
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if (showInfo) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'svelte-w37f43', null, classes, { 'info-button': true, 'has-update': hasUpdate });
		classes_1 = $.set_class(span, 1, 'icon svelte-w37f43', null, classes_1, { 'update-available': hasUpdate });
	});

	$.event('click', button, () => showInfo = !showInfo);
	$.append($$anchor, div);
	$.pop();
}