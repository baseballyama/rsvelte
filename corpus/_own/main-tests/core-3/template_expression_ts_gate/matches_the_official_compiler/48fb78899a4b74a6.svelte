<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#each [1] as it, i (y as string)}<p>{it}{i}</p>{/each}
