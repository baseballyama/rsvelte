<script>
class Service {
  data = $state([]);
  total = $derived(this.data.length);
  getTimeline(opts = {}) {
    const auditTimeline = $derived.by(() => this.data);
    return auditTimeline;
  }
}
</script>