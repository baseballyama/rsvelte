import * as $ from 'svelte/internal/server';
import { Progressradial } from "flowbite-svelte";

export default function Colors($$renderer) {
	Progressradial($$renderer, {
		progress: 65,
		labelOutside: 'default',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'secondary',
		progress: '65',
		labelOutside: 'secondary',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'gray',
		progress: '65',
		labelOutside: 'gray',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'red',
		progress: '65',
		labelOutside: 'red',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'orange',
		progress: '65',
		labelOutside: 'orange',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'amber',
		progress: '65',
		labelOutside: 'amber',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'yellow',
		progress: '65',
		labelOutside: 'yellow',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'lime',
		progress: '65',
		labelOutside: 'lime',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'green',
		progress: '65',
		labelOutside: 'green',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'emerald',
		progress: '65',
		labelOutside: 'emerald',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'teal',
		progress: '65',
		labelOutside: 'teal',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'cyan',
		progress: '65',
		labelOutside: 'cyan',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'sky',
		progress: '65',
		labelOutside: 'sky',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'blue',
		progress: '65',
		labelOutside: 'blue',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'indigo',
		progress: '65',
		labelOutside: 'indigo',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'violet',
		progress: '65',
		labelOutside: 'violet',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'purple',
		progress: '65',
		labelOutside: 'purple',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'fuchsia',
		progress: '65',
		labelOutside: 'fuchsia',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'pink',
		progress: '65',
		labelOutside: 'pink',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!----> `);

	Progressradial($$renderer, {
		color: 'rose',
		progress: '65',
		labelOutside: 'rose',
		classes: { outside: "dark:text-white" }
	});

	$$renderer.push(`<!---->`);
}