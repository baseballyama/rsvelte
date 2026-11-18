<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#if true}{@const { a = y as string } = {}}<p>{a}</p>{/if}
