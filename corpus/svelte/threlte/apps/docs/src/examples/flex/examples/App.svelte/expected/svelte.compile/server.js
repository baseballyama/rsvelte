import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { NoToneMapping } from 'three';
import { onMount } from 'svelte';
import Common from './examples/Common.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selected = '';
		let components = [];

		const load = () => {
			const modules = import.meta.glob('./examples/*/*.svelte', { eager: true });

			components = Object.entries(modules).reduce(
				(acc, [key, module]) => {
					const name = key.split('/')[2];

					if (!name) throw new Error(`No name for ${key}`);

					const isDom = key.includes('Dom');
					const example = acc.find((e) => e.name === name);

					if (example) {
						if (isDom) {
							example.dom = module.default;
						} else {
							example.threlte = module.default;
						}
					} else {
						acc.push({
							name,
							dom: isDom ? module.default : undefined,
							threlte: isDom ? undefined : module.default
						});
					}

					return acc;
				},
				[]
			);

			selected ||= components[0].name;
		};

		onMount(load);

		let example = $.derived(() => components.find((e) => e.name === selected));

		if (example()) {
			$$renderer.push(`<!--[0--><div class="example-view split-view svelte-1tlet67"><div class="dom svelte-1tlet67"><div>`);

			if (example().dom) {
				$$renderer.push('<!--[-->');
				example().dom($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></div> <div class="threlte svelte-1tlet67">`);

			Canvas($$renderer, {
				toneMapping: NoToneMapping,
				children: ($$renderer) => {
					Common($$renderer, {});
					$$renderer.push(`<!----> `);

					if (example().threlte) {
						$$renderer.push('<!--[-->');
						example().threlte($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <nav class="svelte-1tlet67">`);

		$$renderer.select({ value: selected }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(components);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { name } = each_array[$$index];

				$$renderer.option({ value: name }, ($$renderer) => {
					$$renderer.push(`${$.escape(name)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`</nav>`);
	});
}