<script lang="ts">const p = Promise.resolve('x');</script>
{#await p}wait{:then v}{v}{:catch error: unknown}{String(error)}{/await}