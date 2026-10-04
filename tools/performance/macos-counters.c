#include <libproc.h>
#include <sys/resource.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <mach/mach_time.h>
#include <pthread/qos.h>
static struct rusage_info_v4 initial;
static int ready;
__attribute__((constructor)) static void start(void) {
 pthread_set_qos_class_self_np(QOS_CLASS_USER_INITIATED, 0);
 ready = proc_pid_rusage(getpid(), RUSAGE_INFO_V4, (rusage_info_t *)&initial) == 0;
}
__attribute__((destructor)) static void finish(void) {
 struct rusage_info_v4 final = {0};
 if (!ready || proc_pid_rusage(getpid(), RUSAGE_INFO_V4, (rusage_info_t *)&final)) { fprintf(stderr,"PMU read failed\n"); return; }
 const char *path = getenv("RSVELTE_COUNTER_REPORT");
 FILE *file = path ? fopen(path,"w") : stderr;
 if (!file) { perror("counter report"); return; }
 mach_timebase_info_data_t timebase;
 mach_timebase_info(&timebase);
 fprintf(file,"{\"cycles\":%llu,\"instructions\":%llu,\"user_time_ns\":%llu,\"system_time_ns\":%llu}\n",final.ri_cycles-initial.ri_cycles,final.ri_instructions-initial.ri_instructions,(final.ri_user_time-initial.ri_user_time) * timebase.numer / timebase.denom,(final.ri_system_time-initial.ri_system_time) * timebase.numer / timebase.denom);
 if (path) fclose(file);
}
