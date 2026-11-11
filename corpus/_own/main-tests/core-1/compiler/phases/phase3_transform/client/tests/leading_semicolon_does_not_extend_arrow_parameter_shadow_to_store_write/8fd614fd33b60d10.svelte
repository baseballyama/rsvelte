<script>
        import { writable, derived } from 'svelte/store';
        const point4 = writable([0, 0, 0, 0])
        const point3 = derived(
            point4,
            ($point4) => $point4.slice(0, 3)
        )
        ;(point3).set = (newItems) => {
            $point4 = [...newItems, $point4[3]]
        }
    </script>