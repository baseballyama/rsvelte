import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidComboBoxSkeleton from "carbon-components-svelte/ComboBox/FluidComboBoxSkeleton.svelte";

export default function ComboBox_fluidSkeleton_test($$anchor) {
	FluidComboBoxSkeleton($$anchor, { 'data-testid': 'fluid-combo-box-skeleton' });
}