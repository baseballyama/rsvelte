<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#each [{}] as { a = ((a: string) => a)("") }}<p>{a}</p>{/each}
