<script>
        import { t } from 'svelte-i18n';
        import { get } from 'svelte/store';
        $: label = (() => {
            const $t = get(t);
            return $t('calendar.day');
        })();
    </script>
    <p>{$t('template.day')}</p>