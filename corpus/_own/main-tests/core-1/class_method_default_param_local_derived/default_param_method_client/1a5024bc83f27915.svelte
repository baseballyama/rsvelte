<script>
class Service {
  data = $state([]);
  getTimeline(opts = {}) {
    const auditTimeline = $derived.by(() => {
      return this.data;
    });
    return auditTimeline;
  }
}
</script>