import unittest
from unittest.mock import MagicMock, patch
from services.analyzer import EmailAnalyzer, normalize_source, _compute_rank_and_risk
from models.schemas import IMAPCredentials, AnalysisResponse

class TestEmailAnalyzer(unittest.TestCase):
    def setUp(self):
        self.mock_credentials = IMAPCredentials(
            host="imap.test.com",
            email="test@test.com",
            password="password123",
            days_limit=30
        )

    def test_normalize_source_linkedin(self):
        source = normalize_source("jobs-noreply@linkedinmail.com", "LinkedIn Jobs")
        self.assertEqual(source, "linkedin")

    def test_normalize_source_domain_fallback(self):
        source = normalize_source("promo@news.example.com", "Example News")
        self.assertEqual(source, "example")

    def test_compute_rank_and_risk_official_lower_than_suspicious(self):
        rank_susp, risk_susp = _compute_rank_and_risk(
            spam_score=20.0,
            email_count=2,
            unsub_ratio=0.0,
            domain="deals.bogus.xyz",
        )
        rank_off, risk_off = _compute_rank_and_risk(
            spam_score=20.0,
            email_count=2,
            unsub_ratio=0.0,
            domain="notifications@gmail.com",
        )
        self.assertGreater(rank_susp, rank_off)
        self.assertEqual(risk_susp, "high")
        self.assertEqual(risk_off, "low")

    @patch("backend.services.analyzer.MailBox")
    def test_analyze_empty_inbox(self, mock_mailbox_class):
        # Setup mock mailbox with no messages
        mock_mailbox = mock_mailbox_class.return_value
        mock_mailbox.login.return_value.__enter__.return_value = mock_mailbox
        mock_mailbox.fetch.return_value = []

        analyzer = EmailAnalyzer(self.mock_credentials)
        result = analyzer.analyze()

        self.assertIsInstance(result, AnalysisResponse)
        self.assertEqual(result.total_emails_scanned, 0)
        self.assertEqual(result.health_score, 100)
        self.assertEqual(result.ignored_senders, [])

    @patch("backend.services.analyzer.lookup_domain_signals")
    @patch("backend.services.analyzer.MailBox")
    def test_analyze_with_messages(self, mock_mailbox_class, mock_dns):
        mock_dns.return_value = {
            "mx": True,
            "spf": "strict",
            "dmarc": "reject",
            "error": None,
        }
        # Mocking message objects
        class MockMsg:
            def __init__(self, from_email, from_name, seen):
                self.from_values = MagicMock()
                self.from_values.email = from_email
                self.from_values.name = from_name
                self.flags = ['SEEN'] if seen else []
                self.headers = {'list-unsubscribe': ['<https://unsub.com>']}
                self.uid = '123'

        # Setup mock mailbox with messages
        mock_messages = [
            MockMsg("spam@promo.com", "Mega Promo", False),
            MockMsg("spam@promo.com", "Mega Promo", False),
            MockMsg("friend@gmail.com", "My Friend", True),
        ]

        mock_mailbox = mock_mailbox_class.return_value
        mock_mailbox.login.return_value.__enter__.return_value = mock_mailbox
        mock_mailbox.fetch.return_value = mock_messages

        analyzer = EmailAnalyzer(self.mock_credentials)
        result = analyzer.analyze()

        self.assertEqual(result.total_emails_scanned, 3)

        senders = {s.source_key: s for s in result.ignored_senders}
        self.assertIn("promo", senders)
        self.assertEqual(senders["promo"].email_count, 2)
        self.assertEqual(senders["promo"].open_rate, 0.0)
        self.assertEqual(senders["promo"].sender_emails, ["spam@promo.com"])

        self.assertIn("gmail", senders)
        self.assertEqual(senders["gmail"].email_count, 1)
        self.assertEqual(senders["gmail"].open_rate, 100.0)
        self.assertEqual(senders["gmail"].sender_emails, ["friend@gmail.com"])

    @patch("backend.services.analyzer.lookup_domain_signals")
    @patch("backend.services.analyzer.MailBox")
    def test_analyze_orders_suspicious_before_official(self, mock_mailbox_class, mock_dns):
        def dns_side_effect(domain, timeout=2.5):
            if domain.endswith(".xyz"):
                return {"mx": False, "spf": "absent", "dmarc": "absent", "error": None}
            return {"mx": True, "spf": "strict", "dmarc": "reject", "error": None}

        mock_dns.side_effect = dns_side_effect
        class MockMsg:
            def __init__(self, from_email, from_name, seen, headers):
                self.from_values = MagicMock()
                self.from_values.email = from_email
                self.from_values.name = from_name
                self.flags = ['SEEN'] if seen else []
                self.headers = headers
                self.uid = '123'

        mock_messages = [
            MockMsg("ok@google.com", "Google Alerts", True, {'list-unsubscribe': ['<https://unsub.google.com>']}),
            MockMsg("ok@google.com", "Google Alerts", True, {'list-unsubscribe': ['<https://unsub.google.com>']}),
            MockMsg("promo@deals.bogus.xyz", "Hot Deal", False, {}),
            MockMsg("promo@deals.bogus.xyz", "Hot Deal", False, {}),
        ]

        mock_mailbox = mock_mailbox_class.return_value
        mock_mailbox.login.return_value.__enter__.return_value = mock_mailbox
        mock_mailbox.fetch.return_value = mock_messages

        analyzer = EmailAnalyzer(self.mock_credentials)
        result = analyzer.analyze()

        self.assertGreaterEqual(len(result.ignored_senders), 2)
        first = result.ignored_senders[0]
        self.assertIn("bogus", first.source_key or "")
        self.assertEqual(first.spam_risk, "high")

    @patch("backend.services.analyzer.lookup_domain_signals")
    @patch("backend.services.analyzer.MailBox")
    def test_analyze_groups_linkedin_variants(self, mock_mailbox_class, mock_dns):
        mock_dns.return_value = {
            "mx": True,
            "spf": "strict",
            "dmarc": "reject",
            "error": None,
        }
        class MockMsg:
            def __init__(self, from_email, from_name, seen):
                self.from_values = MagicMock()
                self.from_values.email = from_email
                self.from_values.name = from_name
                self.flags = ['SEEN'] if seen else []
                self.headers = {}
                self.uid = '123'

        mock_messages = [
            MockMsg("jobs-noreply@linkedinmail.com", "LinkedIn Jobs", False),
            MockMsg("messages-noreply@linkedin.com", "LinkedIn", True),
        ]

        mock_mailbox = mock_mailbox_class.return_value
        mock_mailbox.login.return_value.__enter__.return_value = mock_mailbox
        mock_mailbox.fetch.return_value = mock_messages

        analyzer = EmailAnalyzer(self.mock_credentials)
        result = analyzer.analyze()

        self.assertEqual(len(result.ignored_senders), 1)
        sender = result.ignored_senders[0]
        self.assertEqual(sender.source_key, "linkedin")
        self.assertEqual(sender.email_count, 2)
        self.assertEqual(set(sender.sender_emails), {
            "jobs-noreply@linkedinmail.com",
            "messages-noreply@linkedin.com",
        })

    @patch("backend.services.analyzer.MailBox")
    def test_delete_emails(self, mock_mailbox_class):
        mock_mailbox = mock_mailbox_class.return_value
        mock_mailbox.login.return_value.__enter__.return_value = mock_mailbox
        mock_mailbox.folder.set = MagicMock()
        
        # Mock folder list to include a trash folder
        mock_folder = MagicMock()
        mock_folder.name = 'Trash'
        mock_mailbox.folder.list.return_value = [mock_folder]
        
        # Mock search results (uids)
        class MockMsg:
            def __init__(self, uid):
                self.uid = uid
        
        msg1 = MockMsg('1')
        msg1.from_values = MagicMock()
        msg1.from_values.email = "spam@promo.com"
        msg2 = MockMsg('2')
        msg2.from_values = MagicMock()
        msg2.from_values.email = "spam@promo.com"
        msg3 = MockMsg('3')
        msg3.from_values = MagicMock()
        msg3.from_values.email = "other@site.com"
        mock_mailbox.fetch.return_value = [msg1, msg2, msg3]

        analyzer = EmailAnalyzer(self.mock_credentials)
        result = analyzer.delete_emails(["spam@promo.com"])

        self.assertEqual(result["deleted"], 2)
        mock_mailbox.move.assert_called_with(['1', '2'], 'Trash')

    def test_compute_rank_and_risk_ufg_official(self):
        # High spam score but official domain should yield low risk
        rank_ufg, risk_ufg = _compute_rank_and_risk(
            spam_score=50.0,
            email_count=5,
            unsub_ratio=0.5, # High unsub is also a good signal
            domain="discente.ufg.br",
        )
        rank_ufg_main, risk_ufg_main = _compute_rank_and_risk(
            spam_score=50.0,
            email_count=5,
            unsub_ratio=0.5,
            domain="ufg.br",
        )
        self.assertEqual(risk_ufg, "low")
        self.assertEqual(risk_ufg_main, "low")
        # Official domains get a significant rank reduction (0.18x)
        self.assertLess(rank_ufg, 10.0) 

if __name__ == "__main__":
    unittest.main()
