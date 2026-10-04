import ctypes
import json
import subprocess

keys = ["hw.perflevel0.name", "hw.perflevel0.l1dcachesize", "hw.perflevel0.l2cachesize", "hw.perflevel1.name", "hw.perflevel1.l1dcachesize", "hw.perflevel1.l2cachesize", "hw.cachelinesize"]
hardware = subprocess.run(["sysctl", *keys], text=True, capture_output=True, check=True).stdout
library = ctypes.CDLL("/System/Library/PrivateFrameworks/kperf.framework/kperf", use_errno=True)
library.kpc_get_thread_counters.argtypes = [ctypes.c_int, ctypes.c_uint, ctypes.POINTER(ctypes.c_uint64)]
library.kpc_get_thread_counters.restype = ctypes.c_int
values = (ctypes.c_uint64 * 32)()
ctypes.set_errno(0)
status = library.kpc_get_thread_counters(0, len(values), values)
error = ctypes.get_errno()
print(json.dumps({"hardware": hardware, "status": status, "errno": error, "returned_buffer": list(values), "cache_misses": "UNMEASURED", "tlb_misses": "UNMEASURED"}, indent=2))
