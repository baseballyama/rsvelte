import * as $ from 'svelte/internal/server';
import { Star } from "flowbite-svelte";

export default function Stars($$renderer) {
	Star($$renderer, { size: 30, iconIndex: 0, fillPercent: 0 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 10, fillPercent: 10 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 20, fillPercent: 20 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 30, fillPercent: 30 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 40, fillPercent: 40 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 50, fillPercent: 50 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 60, fillPercent: 60 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 70, fillPercent: 70 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 80, fillPercent: 80 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 90, fillPercent: 90 });
	$$renderer.push(`<!----> `);
	Star($$renderer, { size: 30, iconIndex: 100, fillPercent: 100 });
	$$renderer.push(`<!---->`);
}