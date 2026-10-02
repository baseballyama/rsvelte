import * as $ from 'svelte/internal/server';
import HeaderSearch from "carbon-components-svelte/UIShell/HeaderSearch.svelte";
import CustomIcon from "./HeaderSearchCustomIcon.test.svelte";

export default function HeaderSearchIcon_test($$renderer) {
	HeaderSearch($$renderer, { icon: CustomIcon });
}