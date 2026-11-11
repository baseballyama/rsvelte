<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#each [{}] as { a = y satisfies string }}<p>{a}</p>{/each}
