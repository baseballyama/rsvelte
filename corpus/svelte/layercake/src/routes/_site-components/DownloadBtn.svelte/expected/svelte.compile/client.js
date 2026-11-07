import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toAuto } from 'do-not-zip';
import { uniques } from 'layercake';
import downloadBlob from '../../_modules/downloadBlob.js';

var root = $.from_html(`<button title="download zip file" class="icon svelte-sjun9w" style="background-image: url(/icons/download.svg)">Download &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>`);

export default function DownloadBtn($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {import('../../_modules/constructReplLink.js').CodeFile} CodeFile
	 * @typedef {import('../../_modules/constructReplLink.js').ExampleContent} ExampleContent
	 */
	/**
	 * @typedef {Object} Props
	 * @property {ExampleContent} [data]
	 * @property {string} slug
	 * @property {boolean} [ssr]
	 */
	/** @type {Props} */
	let data = $.prop($$props, 'data', 19, (/** @type {ExampleContent} */) => ({})),
		ssr = $.prop($$props, 'ssr', 3, false);

	let downloading = $.state(false);

	/** @param {string} [file] */
	function getImports(file = '') {
		const match = file.match(/from\s'(.+)'?/gm) || [];
		const imports = match.map(/** @param {string} d */ (d) => d.replace(/(from |'|"|;)/g, '')).filter(/** @param {string} d */ (d) => !d.startsWith('.'));

		return imports;
	}

	// svelte-ignore state_referenced_locally
	const imports = [
		data().main,
		...data().components,
		...data().componentComponents
	].reduce((/** @type {string[]} */ store, /** @type {CodeFile} */ val) => store.concat(getImports(val.contents)), /** @type {string[]} */ ([])).reduce(
		(/** @type {string[]} */ store, /** @type {string} */ val) => {
			if (!store.includes(val)) {
				store.push(val);

				return store;
			} else {
				return store;
			}
		}, /** @type {string[]} */
		[]
	);

	async function download() {
		$.set(downloading, true);

		// console.log('downloading');
		const cacheBust = new Date().getTime();

		const files = await (await window.fetch(`/svelte-app.json?${cacheBust}`)).json();

		/** @type {Record<string, string>} */
		const depsLookup = await (await window.fetch(`/deps.json?${cacheBust}`)).json();

		if (imports.length > 0) {
			const idx = files.findIndex(/** @param {{ path: string }} file */ ({ path }) => path === 'package.json');
			const pkg = JSON.parse(files[idx].data);

			/** @type {Record<string, string>} */
			const deps = {};

			/** @type {Record<string, string>} */
			const devDeps = {};

			imports.forEach(/** @param {string} mod */ (mod) => {
				if (mod === 'svelte') {
					return;
				} else {
					deps[mod] = depsLookup[mod];
				}

				if (!depsLookup[mod]) {
					window.alert(`Missing dependency, add "${mod}" to this repo's package.json`);
				}
			});

			Object.assign(pkg.dependencies, deps);
			Object.assign(pkg.devDependencies, devDeps);
			files[idx].data = JSON.stringify(pkg, null, '  ');
		}

		files.push(...data().components.map(/** @param {CodeFile} component */ (component) => ({
			path: `src/routes/${component.title.replace('./', '')}`,
			data: component.contents
		})));

		files.push(...data().modules.map(/** @param {CodeFile} mod */ (mod) => ({
			path: `src/routes/${mod.title.replace('./', '')}`,
			data: mod.contents
		})));

		files.push(...data().componentModules.map(/** @param {CodeFile} mod */ (mod) => ({
			path: `src/routes/${mod.title.replace('../', '')}`,
			data: mod.contents
		})));

		files.push(...data().componentComponents.map(/** @param {CodeFile} mod */ (mod) => ({ path: `src/routes/${mod.title}`, data: mod.contents })));

		files.push(...data().csvs.map(/** @param {CodeFile} mod */ (mod) => ({
			path: `src/routes/${mod.title.replace('../', '')}`,
			data: mod.contents
		})));

		files.push(...data().jsons.map(/** @param {CodeFile} mod */ (mod) => ({
			path: `src/routes/${mod.title.replace('../', '')}`,
			data: mod.contents
		})));

		files.push({ path: `src/routes/+page.svelte`, data: data().main.contents });

		// console.log('here', files);
		const filteredFiles = uniques(files.filter(Boolean), 'path', false);

		downloadBlob(toAuto(filteredFiles), `layercake-${ssr() ? 'ssr-' : ''}${$$props.slug}.zip`);
		$.set(downloading, false);
	}

	var button = root();

	$.template_effect(() => button.disabled = $.get(downloading));
	$.delegated('click', button, download);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);