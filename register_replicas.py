import requests
import urllib3

# Disable only the warning (not verification globally!)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CONTROLLER = "https://localhost:8000/register"

replicas = [
    {"replica_id": "replica1", "base_url": "https://localhost:8101"},
    {"replica_id": "replica2", "base_url": "https://localhost:8102"},
    {"replica_id": "replica3", "base_url": "https://localhost:8103"},
]



for r in replicas:
    try:
        res = requests.post(CONTROLLER, json=r, verify=False)
        print(f"Registering {r['replica_id']} -> {res.status_code} {res.text}")
    except Exception as e:
        print(f"Failed to register {r['replica_id']}: {e}")
