import unittest
from models.schemas import IMAPCredentials, SenderStats

class TestSchemas(unittest.TestCase):
    def test_imap_credentials_validation(self):
        # Test basic validation
        creds = IMAPCredentials(
            host="imap.gmail.com",
            email="user@gmail.com",
            password="password",
            days_limit=30
        )
        self.assertEqual(creds.host, "imap.gmail.com")
        self.assertEqual(creds.email, "user@gmail.com")

    def test_sender_stats_formatting(self):
        stats = SenderStats(
            sender_name="Test User",
            sender_email="test@example.com",
            email_count=10,
            open_rate=50.0,
            spam_score=5.0
        )
        self.assertEqual(stats.sender_name, "Test User")
        self.assertEqual(stats.email_count, 10)

if __name__ == "__main__":
    unittest.main()
