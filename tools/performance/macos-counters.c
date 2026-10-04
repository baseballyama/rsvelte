#include <libproc.h>
#include <sys/resource.h>
#include <sys/sysctl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <mach/mach_time.h>
#include <pthread/qos.h>
// Every rusage_info version extends the previous one, so a V4 answer fills a prefix of this buffer.
static struct rusage_info_v6 initial;
static int measured, ready, flavor, performance_levels;
static pid_t owner;
static char *path;
static int read_usage(struct rusage_info_v6 *info) { return proc_pid_rusage(getpid(), flavor, (rusage_info_t *)info); }
__attribute__((constructor)) static void start(void) {
 // Children inherit the injected library; only the process the runner started is measured.
 if (getenv("RSVELTE_COUNTER_CHILD")) return;
 measured = 1;
 owner = getpid();
 setenv("RSVELTE_COUNTER_CHILD", "1", 1);
 const char *report = getenv("RSVELTE_COUNTER_REPORT");
 if (report) path = strdup(report);
 unsetenv("RSVELTE_COUNTER_REPORT");
 size_t size = sizeof performance_levels;
 if (sysctlbyname("hw.nperflevels", &performance_levels, &size, 0, 0)) performance_levels = 0;
 pthread_set_qos_class_self_np(QOS_CLASS_USER_INITIATED, 0);
#ifdef RSVELTE_COUNTERS_FORCE_V4
 flavor = RUSAGE_INFO_V4;
#else
 flavor = RUSAGE_INFO_V6;
 // An older kernel rejects an unknown flavor; V4 still gives every required counter.
 if (read_usage(&initial)) flavor = RUSAGE_INFO_V4;
#endif
 ready = read_usage(&initial) == 0;
}
__attribute__((destructor)) static void finish(void) {
 // A forked child that never execs keeps these statics and would overwrite the parent's report.
 if (!measured || getpid() != owner) return;
 struct rusage_info_v6 final = {0};
 if (!ready || read_usage(&final)) { fprintf(stderr,"PMU read failed\n"); return; }
 FILE *file = path ? fopen(path,"w") : stderr;
 if (!file) { perror("counter report"); return; }
 mach_timebase_info_data_t timebase;
 mach_timebase_info(&timebase);
 unsigned long long child = (final.ri_child_user_time-initial.ri_child_user_time)+(final.ri_child_system_time-initial.ri_child_system_time);
 fprintf(file,"{\"cycles\":%llu,\"instructions\":%llu,\"user_time_ns\":%llu,\"system_time_ns\":%llu,\"child_time_ns\":%llu,\"lifetime_max_phys_footprint_bytes\":%llu,\"rusage_flavor\":%d,\"performance_levels\":%d",final.ri_cycles-initial.ri_cycles,final.ri_instructions-initial.ri_instructions,(final.ri_user_time-initial.ri_user_time) * timebase.numer / timebase.denom,(final.ri_system_time-initial.ri_system_time) * timebase.numer / timebase.denom,child * timebase.numer / timebase.denom,final.ri_lifetime_max_phys_footprint,flavor,performance_levels);
 // P-core counters only mean something with V6 on a host that has more than one core type.
 if (flavor == RUSAGE_INFO_V6 && performance_levels > 1) fprintf(file,",\"p_cycles\":%llu,\"p_instructions\":%llu}\n",final.ri_pcycles-initial.ri_pcycles,final.ri_pinstructions-initial.ri_pinstructions);
 else fprintf(file,",\"p_cycles\":null,\"p_instructions\":null}\n");
 if (path) fclose(file);
}
