<script>
    import { derived, writable } from 'svelte/store';
    export let flatData = [];
    export let xDomain = undefined;
    const _a = writable(1);
    const extents_d = derived(
        [_a],
        ([
            $flatData,
            $xDomain
        ]) => {
            return [$flatData, $xDomain];
        }
    );
</script>
<p>{$extents_d}</p>
