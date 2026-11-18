<script module lang="ts">export const zz: number = 1;</script>
<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#each [{}] as { a = y satisfies string }}<p>{a}</p>{/each}
