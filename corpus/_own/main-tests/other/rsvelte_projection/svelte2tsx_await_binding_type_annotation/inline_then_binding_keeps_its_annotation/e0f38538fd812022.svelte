<script lang="ts">const p = Promise.resolve('x');</script>
{#await p then value: string}{value}{/await}