# ============================================================
# API 验证脚本 — 测试 Freqtrade webserver 各端点
# 运行: python scripts\verify-api.py
# ============================================================
import urllib.request
import urllib.error
import json
import base64
import sys
import time

API_BASE = "http://127.0.0.1:8080/api/v1"
AUTH = base64.b64encode(b"freqtrader:SuperSecurePassword").decode()

def req(method, path, body=None):
    url = f"{API_BASE}{path}"
    headers = {
        "Authorization": f"Basic {AUTH}",
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def check(name, status, data, expected_status=200):
    ok = status == expected_status
    icon = "[OK]" if ok else "[FAIL]"
    print(f"  {icon} {name} (HTTP {status})")
    if not ok:
        print(f"       Error: {data}")
    else:
        # Show a preview
        if isinstance(data, dict):
            preview = {k: data[k] for k in list(data.keys())[:3]}
            print(f"       {json.dumps(preview, ensure_ascii=False)[:100]}")
    return ok

print("============================================")
print(" Freqtrade API 端点验证")
print("============================================")
print(f" API: {API_BASE}")
print()

all_ok = True

# ---- Public endpoints ----
print("--- Public ---")
s, d = req("GET", "/ping")
all_ok &= check("GET /ping", s, d)

# ---- Info endpoints ----
print("\n--- Info ---")
s, d = req("GET", "/version")
all_ok &= check("GET /version", s, d)

s, d = req("GET", "/show_config")
all_ok &= check("GET /show_config", s, d)

s, d = req("GET", "/health")
all_ok &= check("GET /health", s, d)

# ---- Strategy endpoints ----
print("\n--- Strategies ---")
s, d = req("GET", "/strategies")
all_ok &= check("GET /strategies", s, d)
if isinstance(d, dict) and d.get("strategies"):
    strat_name = d["strategies"][0]
    s2, d2 = req("GET", f"/strategy/{strat_name}")
    all_ok &= check(f"GET /strategy/{strat_name}", s2, d2)

# ---- Trading info (empty in dry-run without active trades) ----
print("\n--- Trading Info ---")
s, d = req("GET", "/balance")
all_ok &= check("GET /balance", s, d)

s, d = req("GET", "/count")
all_ok &= check("GET /count", s, d)

s, d = req("GET", "/profit")
all_ok &= check("GET /profit", s, d)

s, d = req("GET", "/daily")
all_ok &= check("GET /daily", s, d)

s, d = req("GET", "/status")
all_ok &= check("GET /status", s, d)

# ---- Backtest endpoints ----
print("\n--- Backtest ---")
s, d = req("GET", "/backtest/history")
all_ok &= check("GET /backtest/history", s, d)
if isinstance(d, list) and len(d) > 0:
    entry = d[0]
    print(f"       Latest: {entry.get('strategy')} ({entry.get('timeframe')}) "
          f"{time.strftime('%Y-%m-%d', time.localtime(entry.get('backtest_start_time', 0)))}")

    # Load historical result
    filename = entry.get("filename", "")
    if filename:
        s2, d2 = req("GET", f"/backtest/history/result?filename={filename}")
        all_ok &= check("GET /backtest/history/result", s2, d2)

# ---- Misc ----
print("\n--- Other ---")
s, d = req("GET", "/exchanges")
all_ok &= check("GET /exchanges", s, d)

s, d = req("GET", "/locks")
all_ok &= check("GET /locks", s, d)

s, d = req("GET", "/whitelist")
all_ok &= check("GET /whitelist", s, d)

# ---- Summary ----
print()
print("============================================")
if all_ok:
    print(" ALL CHECKS PASSED")
    print(" Freqtrade API is fully operational.")
    print(" Ready for desktop UI connection.")
else:
    print(" SOME CHECKS FAILED")
    print(" Review errors above and check Freqtrade logs.")
print("============================================")

sys.exit(0 if all_ok else 1)
