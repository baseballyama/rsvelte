#include <libproc.h>
#include <stdint.h>
#include <sys/resource.h>
int read_process_counters(int pid, uint64_t *counters) {
    struct rusage_info_v4 usage = {0};
    if (proc_pid_rusage(pid, RUSAGE_INFO_V4, (rusage_info_t *)&usage) != 0) return -1;
    counters[0] = usage.ri_cycles;
    counters[1] = usage.ri_instructions;
    return 0;
}
