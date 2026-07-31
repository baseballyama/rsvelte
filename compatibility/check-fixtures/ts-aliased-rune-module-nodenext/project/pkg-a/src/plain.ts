import { useProvider } from '$lib/modules/provider.svelte';
import theme, { tokens } from '$lib/modules/theme.svelte';
import makeState, { shared } from '$libs/modules/state.svelte';
import type { RowShape } from '$libs/components/data-table.svelte';
import type Widget from '$lib/anatomy/widget.svelte';

export const size: number = useProvider().size + tokens.length;
export const themeName: string = theme.name;
export const count: number = shared.count + makeState().count;
export const emptyRow: RowShape = { id: '' };
export let widget: Widget | null = null;
