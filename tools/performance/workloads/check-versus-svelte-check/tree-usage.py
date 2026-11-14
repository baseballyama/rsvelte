"""Run a command; write its wall time and CPU / memory of its whole process tree as JSON.

usage: python3 -I tree-usage.py <out.json> -- <command> [args...]

Two instruments, because neither sees everything:

- rusage(RUSAGE_CHILDREN) is exact but only covers descendants that were *reaped*. A checker
  that talks to a tsgo process through the TypeScript API and lets it die without waiting for it
  is invisible here.
- psutil sampling of the live tree every SAMPLE_S sees every descendant, including unreaped ones:
  tree CPU is the sum of each process's last observed user+sys (misses at most one interval per
  process), and peak tree RSS is the largest sum of RSS across one sample.

ru_maxrss is the largest single process, not a sum: KiB on Linux, bytes on macOS.
"""

import json
import resource
import subprocess
import sys
import time

import psutil

SAMPLE_S = 0.02

out = sys.argv[1]
assert sys.argv[2] == "--", sys.argv
cmd = sys.argv[3:]

before = resource.getrusage(resource.RUSAGE_CHILDREN)
start = time.perf_counter()
proc = subprocess.Popen(cmd)
cpu_by_pid = {}
samples = 0
denied = 0
peak_tree_rss = 0
max_procs = 0
while True:
    # A fresh handle every time: one taken before the child exec()s is judged a reused pid.
    try:
        root = psutil.Process(proc.pid)
        procs = [root] + root.children(recursive=True)
    except psutil.NoSuchProcess:
        procs = []
    samples += 1
    rss = 0
    alive = 0
    for p in procs:
        try:
            with p.oneshot():
                t = p.cpu_times()
                m = p.memory_info()
            cpu_by_pid[(p.pid, p.create_time())] = t.user + t.system
            rss += m.rss
            alive += 1
        except psutil.AccessDenied:
            denied += 1
        except (psutil.NoSuchProcess, psutil.ZombieProcess):
            pass
    peak_tree_rss = max(peak_tree_rss, rss)
    max_procs = max(max_procs, alive)
    if proc.poll() is not None:
        break
    time.sleep(SAMPLE_S)
status = proc.returncode
wall = time.perf_counter() - start
after = resource.getrusage(resource.RUSAGE_CHILDREN)

maxrss = after.ru_maxrss
maxrss_kib = maxrss // 1024 if sys.platform == "darwin" else maxrss

with open(out, "w") as f:
    json.dump(
        {
            "status": status,
            "wallMs": wall * 1000,
            "userMs": (after.ru_utime - before.ru_utime) * 1000,
            "sysMs": (after.ru_stime - before.ru_stime) * 1000,
            "maxRssKiB": maxrss_kib,
            "treeCpuMs": sum(cpu_by_pid.values()) * 1000,
            "treePeakRssKiB": peak_tree_rss // 1024,
            "treeMaxProcs": max_procs,
            "treePids": len(cpu_by_pid),
            "treeSamples": samples,
            "treeDenied": denied,
        },
        f,
    )
sys.exit(0)
