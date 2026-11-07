import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeaderSearch from "carbon-components-svelte/UIShell/HeaderSearch.svelte";
import CustomIcon from "./HeaderSearchCustomIcon.test.svelte";

export default function HeaderSearchIcon_test($$anchor) {
	HeaderSearch($$anchor, {
		get icon() {
			return CustomIcon;
		}
	});
}