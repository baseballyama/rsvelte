<script module lang="ts">export const zz: number = 1;</script>
<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#snippet s()}<p>{y as string}</p>{/snippet}{@render s()}
