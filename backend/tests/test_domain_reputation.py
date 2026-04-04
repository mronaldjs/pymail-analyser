import unittest
import os
import tempfile

from backend.services.domain_reputation import (
    dns_signals_to_trust,
    describe_domain_signals_pt,
    _cache_set,
    _cache_get,
)


class TestDomainReputation(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(delete=False)
        self.tmp.close()
        os.environ["DOMAIN_REPUTATION_CACHE_FILE"] = self.tmp.name

    def tearDown(self):
        try:
            os.unlink(self.tmp.name)
        except FileNotFoundError:
            pass
        os.environ.pop("DOMAIN_REPUTATION_CACHE_FILE", None)

    def test_trust_reject_dmarc_strict_spf(self):
        sig = {
            "mx": True,
            "spf": "strict",
            "dmarc": "reject",
            "error": None,
        }
        self.assertGreater(dns_signals_to_trust(sig), 0.5)

    def test_trust_permissive_spf_low(self):
        sig = {
            "mx": True,
            "spf": "permissive",
            "dmarc": "none",
            "error": None,
        }
        self.assertLess(dns_signals_to_trust(sig), 0.0)

    def test_describe_pt_includes_mx_spf_dmarc(self):
        s = describe_domain_signals_pt(
            {"mx": True, "spf": "strict", "dmarc": "reject", "error": None}
        )
        self.assertIn("MX", s)
        self.assertIn("SPF", s)
        self.assertIn("DMARC", s)

    def test_cache_set_and_get(self):
        _cache_set("k1", {"a": 1})
        got = _cache_get("k1", ttl_seconds=60)
        self.assertEqual(got, {"a": 1})


if __name__ == "__main__":
    unittest.main()
