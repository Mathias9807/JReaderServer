#!/usr/bin/env python3

import unittest
import subprocess
import requests
import json
import time

ip = 'http://127.0.0.1:3000'

class TestStringMethods(unittest.TestCase):
    process = {}

    @classmethod
    def setUpClass(self):
        subprocess.run(['rm','-rf','./test.dict'])
        self.process = subprocess.Popen(['node','app.js','test.dict'], shell=False,
                stdout=None)
                # stdout=subprocess.DEVNULL)
        time.sleep(1)

    def get(self):
        r = requests.get(ip)
        return json.loads(r.text)

    def post(self, data):
        r = requests.post(ip, data=json.dumps(data))
        return r

    def delete(self, data):
        r = requests.delete(ip, data=json.dumps(data))
        return r

    def test_emptyDict(self):
        # Start empty
        self.assertEqual(self.get(), {'uDict': [], 'oDict': []})

        # Add a few elements
        self.post({'uDict': ["2"], 'oDict': ["6"]})
        self.assertEqual(self.get(), {'uDict': ["2"], 'oDict': ["6"]})

        # Delete an element
        self.delete({'oDict': ["6"]})
        self.assertEqual(self.get(), {'uDict': ["2"], 'oDict': []})

        # Add a few more elements
        self.post({'uDict': ["2", "3"], 'oDict': ["8"]})
        self.assertEqual(self.get(), {'uDict': ["2", "3"], 'oDict': ["8"]})

    @classmethod
    def tearDownClass(self):
        self.process.terminate()
        self.process.wait()
        subprocess.run(['rm','-rf','./test.dict'])

if __name__ == '__main__':
    unittest.main()

