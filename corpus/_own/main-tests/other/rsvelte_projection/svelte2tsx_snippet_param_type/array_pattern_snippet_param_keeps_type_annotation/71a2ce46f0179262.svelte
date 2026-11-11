<script lang="ts">let v = 1;</script>
{#snippet row([first]: [string?])}
<button>{first}{v}</button>
{/snippet}
{@render row([])}