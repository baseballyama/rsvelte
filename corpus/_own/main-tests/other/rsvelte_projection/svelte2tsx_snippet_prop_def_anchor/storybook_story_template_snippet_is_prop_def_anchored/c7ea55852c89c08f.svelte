<script module lang="ts">
import { defineMeta } from '@storybook/addon-svelte-csf';
import B from './B.svelte';
const { Story } = defineMeta({ title: 'X/B', component: B, args: { label: 'x' } });
</script>
<Story name="Default">
{#snippet template(args)}
<B {...args} />
{/snippet}
</Story>