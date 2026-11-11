<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#if true}{@const { a = <string>y } = {}}<p>{a}</p>{/if}
