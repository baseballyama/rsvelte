<script lang="ts">
    import { _ } from './i18n-test-svelte-i18n'; // _: Readable<MessageFormatter>, _: Readable<MessageFormatter>
</script>

<main>
    <input name={$_('test')}> <!-- $_('test'): string -->
</main>