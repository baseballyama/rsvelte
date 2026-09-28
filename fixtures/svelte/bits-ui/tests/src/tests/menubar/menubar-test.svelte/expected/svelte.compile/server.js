import * as $ from 'svelte/internal/server';
import { Menubar } from "bits-ui";
import MenubarMenu from "./menubar-menu-test.svelte";

export default function Menubar_test($$renderer, $$props) {
	let { one, two, three, four, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<main><button data-testid="previous-button">previous button</button> `);

	if (Menubar.Root) {
		$$renderer.push('<!--[-->');

		Menubar.Root($$renderer, $.spread_props([
			restProps,
			{
				'data-testid': 'root',
				children: ($$renderer) => {
					MenubarMenu($$renderer, $.spread_props([{ id: '1' }, one]));
					$$renderer.push(`<!----> `);
					MenubarMenu($$renderer, $.spread_props([{ id: '2' }, two]));
					$$renderer.push(`<!----> `);
					MenubarMenu($$renderer, $.spread_props([{ id: '3' }, three]));
					$$renderer.push(`<!----> `);
					MenubarMenu($$renderer, $.spread_props([{ id: '4' }, four]));
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button data-testid="next-button">next button</button></main>`);
}