<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#each [1] as it}{#if it}<p>{y as string}</p>{/if}{/each}
