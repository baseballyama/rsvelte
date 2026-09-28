import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Video($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			type = "video/mp4",
			trackSrc,
			src,
			srclang = "en",
			label = "english_captions",
			class: classname,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("span"));

		$$renderer.push(`<video${$.attributes({ ...restProps, class: $.clsx(clsx(theme(), classname)) })}><source${$.attr('src', src)}${$.attr('type', type)}/> `);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <track${$.attr('src', trackSrc)} kind="captions"${$.attr('srclang', srclang)}${$.attr('label', label)}/> Your browser does not support the video tag.</video>`);
	});
}