<script context="module" lang="ts">
export const wrap = <T>(value: T) => <Box<T>>(() => <Inner<T>>value);
</script>