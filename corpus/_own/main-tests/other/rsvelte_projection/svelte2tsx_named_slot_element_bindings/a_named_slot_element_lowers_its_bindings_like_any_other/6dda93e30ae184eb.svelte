<script lang="ts">let element: HTMLButtonElement;</script>
{#each [1] as n}<button bind:this={element}>{n}</button>{/each}