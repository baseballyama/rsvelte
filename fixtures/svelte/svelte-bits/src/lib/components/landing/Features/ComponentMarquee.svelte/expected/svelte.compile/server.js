import * as $ from 'svelte/internal/server';

export default function ComponentMarquee($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const toSlug = (s) => s.toLowerCase().replace(/\s+/g, '-');

		const ROW_A = [
			{ name: 'Dot Field', cat: 'backgrounds' },
			{ name: 'Line Waves', cat: 'backgrounds' },
			{ name: 'Blob Cursor', cat: 'animations' },
			{ name: 'Soft Aurora', cat: 'backgrounds' },
			{ name: 'Magnet Lines', cat: 'animations' },
			{ name: 'Antigravity', cat: 'animations' },
			{ name: 'Ballpit', cat: 'backgrounds' },
			{ name: 'Pixel Trail', cat: 'animations' },
			{ name: 'Magic Rings', cat: 'animations' }
		];

		const ROW_B = [
			{ name: 'Radar', cat: 'backgrounds' },
			{ name: 'Shape Grid', cat: 'backgrounds' },
			{ name: 'Ribbons', cat: 'animations' },
			{ name: 'Grainient', cat: 'backgrounds' },
			{ name: 'Orbit Images', cat: 'animations' },
			{ name: 'Metallic Paint', cat: 'animations' },
			{ name: 'Balatro', cat: 'backgrounds' },
			{ name: 'Aurora', cat: 'backgrounds' },
			{ name: 'Splash Cursor', cat: 'animations' },
			{ name: 'Beams', cat: 'backgrounds' }
		];

		// Note: components don't exist yet, so links go to /get-started/introduction
		const HREF = '/get-started/introduction';

		const rowADoubled = [...ROW_A, ...ROW_A];
		const rowBDoubled = [...ROW_B, ...ROW_B];

		$$renderer.push(`<div class="ln-feat-marquee"><div class="ln-feat-marquee-track"><div class="ln-feat-marquee-scroll"><!--[-->`);

		const each_array = $.ensure_array_like(rowADoubled);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let c = each_array[i];

			$$renderer.push(`<a${$.attr('href', HREF)}${$.attr('data-slug', toSlug(c.name))}${$.attr('data-cat', c.cat)} class="ln-feat-pill">${$.escape(c.name)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="ln-feat-marquee-track"><div class="ln-feat-marquee-scroll ln-feat-marquee-scroll--rev"><!--[-->`);

		const each_array_1 = $.ensure_array_like(rowBDoubled);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let c = each_array_1[i];

			$$renderer.push(`<a${$.attr('href', HREF)}${$.attr('data-slug', toSlug(c.name))}${$.attr('data-cat', c.cat)} class="ln-feat-pill">${$.escape(c.name)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}