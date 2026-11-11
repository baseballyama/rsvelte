<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#each [1] as it (it)}<p animate:flip={{ k: y as string }}>x</p>{/each}
