import * as $ from 'svelte/internal/server';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import CogIcon from '@lucide/svelte/icons/cog';
import HouseIcon from '@lucide/svelte/icons/house';

export default function Icons($$renderer) {
	$$renderer.push(`<ol class="flex items-center gap-4"><li><a class="opacity-60 hover:opacity-100" href="#">`);
	HouseIcon($$renderer, { size: 24 });
	$$renderer.push(`<!----></a></li> <li class="opacity-50" aria-hidden="">`);
	ChevronRightIcon($$renderer, { size: 14 });
	$$renderer.push(`<!----></li> <li><a class="opacity-60 hover:opacity-100" href="#">`);
	CogIcon($$renderer, { size: 24 });
	$$renderer.push(`<!----></a></li> <li class="opacity-50" aria-hidden="">`);
	ChevronRightIcon($$renderer, { size: 14 });
	$$renderer.push(`<!----></li> <li>Current</li></ol>`);
}