import sys
from pathlib import Path

import pytest


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


@pytest.fixture(autouse=True)
def _disable_rate_limiter():
    """Disable the slowapi limiter for every test by default.

    The per-IP limit would otherwise make HTTP tests flaky once several requests
    to the same endpoint run within a minute. The dedicated rate-limit test
    re-enables it explicitly.
    """
    import main

    main.limiter.enabled = False
    yield
    main.limiter.enabled = False