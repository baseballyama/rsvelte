<script lang="ts">const p = Promise.resolve('x');</script>
{#await p}wait{:then value: string}{value}{/await}