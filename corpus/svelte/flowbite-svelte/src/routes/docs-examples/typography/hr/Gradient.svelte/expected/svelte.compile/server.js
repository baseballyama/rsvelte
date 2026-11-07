import * as $ from 'svelte/internal/server';
import { Hr } from "flowbite-svelte";

export default function Gradient($$renderer) {
	Hr($$renderer, {
		classes: { bg: "h-2 bg-gradient-to-r from-pink-500 to-indigo-500" }
	});

	$$renderer.push(`<!----> `);

	Hr($$renderer, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
		}
	});

	$$renderer.push(`<!----> `);

	Hr($$renderer, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"
		}
	});

	$$renderer.push(`<!----> `);

	Hr($$renderer, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400"
		}
	});

	$$renderer.push(`<!----> `);

	Hr($$renderer, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400"
		}
	});

	$$renderer.push(`<!---->`);
}