import * as $ from 'svelte/internal/server';

export default function Icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			name,
			size = '24',
			viewBox = '0 0 24 24',
			flip = 'none',
			rotate = 0,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let sx = $.derived(() => ['both', 'horizontal'].includes(flip) ? '-1' : '1');
		let sy = $.derived(() => ['both', 'vertical'].includes(flip) ? '-1' : '1');
		let r = $.derived(() => Number.isNaN(rotate) ? rotate : `${rotate}deg`);

		$.await($$renderer, import(`@mdi/js`), () => {}, (paths) => {
			$$renderer.push(`<svg${$.attributes(
				{
					width: size,
					height: size,
					viewBox,
					style: `--sx:${sx()}; --sy:${sy()}; --r:${$.stringify(r())}`,
					...rest
				},
				'svelte-194f7vy',
				{ spin: name === 'mdiLoading' },
				void 0,
				3
			)}><path${$.attr('d', paths[name])} class="svelte-194f7vy"></path></svg>`);
		});

		$$renderer.push(`<!--]-->`);
	});
}