import * as $ from 'svelte/internal/server';
import FluidComboBoxSkeleton from "carbon-components-svelte/ComboBox/FluidComboBoxSkeleton.svelte";

export default function ComboBox_fluidSkeleton_test($$renderer) {
	FluidComboBoxSkeleton($$renderer, { 'data-testid': 'fluid-combo-box-skeleton' });
}