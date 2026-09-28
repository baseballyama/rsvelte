import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 124"><path d="M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z" class="fill-white stroke-surface-content dark:stroke-surface-100 stroke-3" transform="rotate(-26.565 -1546.131 1919.596) skewX(36.87)"></path><path d="M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z" class="fill-white stroke-surface-content dark:stroke-surface-100 stroke-3" transform="rotate(-26.565 -1586.546 1910.056) skewX(36.87)"></path><path d="M-1.004 972.8c.632 0 1.004.298 1.004.803v47.187c0 .61-.537 1.42-1.388 2.1-.85.68-1.868 1.11-2.628 1.11h-58.98c-.632 0-1.004-.3-1.004-.8v-47.187c0-.609.537-1.423 1.388-2.103.85-.68 1.868-1.11 2.628-1.11h58.98Z" class="fill-white stroke-surface-content dark:stroke-surface-100 stroke-3" transform="rotate(-26.565 -1626.96 1900.515) skewX(36.87)"></path><path d="m1335.68 438.866 38.16-19.082 38.16 19.082M1335.68 457.947l19.08-9.541M1412 457.947l-19.08-9.541" class="fill-none stroke-black/10 stroke-3" transform="translate(-1307.917 -383.848)"></path><path d="m1354.76 448.406 19.08-9.54 19.08 9.54" class="fill-none stroke-black/5 stroke-3" transform="translate(-1307.917 -383.848)"></path><path d="m1545.57 183.996-65.42 32.711v57.243l65.42 32.711 65.42-32.711v-57.243l-65.42-32.711Z" class="fill-none stroke-current/30 stroke-2 [stroke-dasharray:4,8] [stroke-linecap:round] dark:mix-blend-difference" transform="translate(-1479.647 -183.496)"></path><path d="m1480.15 216.707 65.42 32.71 65.42-32.71M1545.57 306.661v-57.244" class="fill-none stroke-current/30 stroke-2 [stroke-dasharray:4,8] [stroke-linecap:round] dark:mix-blend-difference" transform="translate(-1479.647 -183.496)"></path></svg>`);

export default function Logo($$anchor, $$props) {
	$.push($$props, true);

	var svg = root();

	$.template_effect(($0) => $.set_class(svg, 0, $0), [() => $.clsx(cls('inline-block', $$props.class))]);
	$.append($$anchor, svg);
	$.pop();
}