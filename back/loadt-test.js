import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 150 },
    { duration: '30s', target: 250 },
    { duration: '30s', target: 400 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 500 },
  ],
};

export default function () {
  const url = 'http://localhost:3000/api/candidates/login';

  const payload = JSON.stringify({
    email: 'admin@mail.com',
    password: 'admin',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status OK': (r) => r.status === 200,
  });
}