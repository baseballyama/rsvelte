<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#snippet s()}<p>{y as string}</p>{/snippet}{@render s()}
