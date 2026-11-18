<script module>
    export const animate = () => {};
</script>

<script>
    const { initial, animate } = $props();
    const style = $state(initial ?? animate);
</script>