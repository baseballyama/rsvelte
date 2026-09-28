import * as $ from 'svelte/internal/server';

export default function StatusBadge($$renderer, $$props) {
	let { status, class: cls, children, $$slots, $$events, ...rest } = $$props;

	const BADGE_CLASSES = {
		beta: 'hl-info',
		dev: 'hl-warning',
		new: 'hl-success',
		flux: 'hl-error',
		stable: 'bg-gray-700 text-white'
	};

	let badgeClass = $.derived(() => BADGE_CLASSES[status]);

	$$renderer.push(`<span${$.attributes({
		class: `rounded-lg px-1.5 py-px text-xs ${$.stringify(badgeClass())} ${$.stringify(cls)}`,
		...rest
	})}>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push(`<!--[-1-->${$.escape(status)}`);
	}

	$$renderer.push(`<!--]--></span>`);
}