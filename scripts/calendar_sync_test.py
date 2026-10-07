"""Contract checks with a fake API; no Google events are created."""
import unittest
from calendar_sync import execute


class Request:
    def __init__(self, result):
        self.result, self.headers = result, {}

    def execute(self):
        return self.result


class API:
    def __init__(self):
        self.calls = []

    def events(self):
        return self

    def list(self, **args):
        self.calls.append(args)
        return Request({'items': [{'id': 'occurrence', 'summary': 'Test', 'etag': 'revision',
                                  'start': {'date': '2099-01-01'}, 'end': {'date': '2099-01-02'}}],
                        **({'nextPageToken': 'page2'} if args['pageToken'] is None else {})})

    def patch(self, **args):
        self.calls.append(args)
        self.request = Request({'id': args['eventId'], 'etag': 'new-revision'})
        return self.request


class CalendarChecks(unittest.TestCase):
    def test_disconnected_does_not_read_snapshot(self):
        self.assertEqual(execute({}, None)['events'], [])
        self.assertFalse(execute({}, None)['connected'])

    def test_recurrences_and_pagination_are_requested(self):
        api = API()
        result = execute({'action': 'list'}, api)
        self.assertEqual(len(result['events']), 2)
        self.assertTrue(api.calls[0]['singleEvents'])
        self.assertEqual(api.calls[1]['pageToken'], 'page2')
        self.assertTrue(result['live_sync'])

    def test_update_protects_against_conflicting_revision(self):
        api = API()
        execute({'action': 'update', 'title': 'Test', 'id': 'event', 'etag': 'old-revision',
                 'start': '2099-01-01T10:00:00-03:00', 'end': '2099-01-01T11:00:00-03:00'}, api)
        self.assertEqual(api.request.headers['If-Match'], 'old-revision')
        self.assertEqual(api.calls[0]['sendUpdates'], 'none')

    def test_naive_time_is_rejected_before_write(self):
        api = API()
        with self.assertRaises(ValueError):
            execute({'action': 'create', 'title': 'Test', 'start': '2099-01-01T10:00:00',
                     'end': '2099-01-01T11:00:00'}, api)
        self.assertFalse(api.calls)


if __name__ == '__main__':
    unittest.main()
