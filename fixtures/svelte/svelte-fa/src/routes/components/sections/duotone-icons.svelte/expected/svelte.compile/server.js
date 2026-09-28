import * as $ from 'svelte/internal/server';
import DocsCode from "../ui/docs-code.svelte";
import DocsImg from "../ui/docs-img.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Duotone_icons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Duotone Icons' });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Basic Use', level: 3 });
		$$renderer.push(`<!----> `);
		DocsImg($$renderer, { src: 'assets/duotone-0.png', alt: 'duotone icons basic use' });
		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[0], lang: 'js' });
		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[1] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Swapping Layer Opacity', level: 3 });
		$$renderer.push(`<!----> `);

		DocsImg($$renderer, {
			src: 'assets/duotone-1.png',
			alt: 'swapping duotone icons layer opacity'
		});

		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[2] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Changing Opacity', level: 3 });
		$$renderer.push(`<!----> `);

		DocsImg($$renderer, {
			src: 'assets/duotone-2.png',
			alt: 'changing duotone icons opacity'
		});

		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[3] });
		$$renderer.push(`<!----> `);

		DocsImg($$renderer, {
			src: 'assets/duotone-3.png',
			alt: 'changing duotone icons opacity'
		});

		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[4] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Coloring Duotone Icons', level: 3 });
		$$renderer.push(`<!----> `);
		DocsImg($$renderer, { src: 'assets/duotone-4.png', alt: 'coloring duotone icons' });
		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[5] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Advanced Use', level: 3 });
		$$renderer.push(`<!----> `);

		DocsImg($$renderer, {
			src: 'assets/duotone-5.png',
			alt: 'duotone icons advanced use'
		});

		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[6] });
		$$renderer.push(`<!----> `);

		DocsImg($$renderer, {
			src: 'assets/duotone-6.png',
			alt: 'duotone icons advanced use'
		});

		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[7] });
		$$renderer.push(`<!----> `);

		DocsImg($$renderer, {
			src: 'assets/duotone-7.png',
			alt: 'duotone icons advanced use'
		});

		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[8], lang: 'js' });
		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.duotoneIcons[9] });
		$$renderer.push(`<!---->`);
	});
}