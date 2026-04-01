import { safeFetch } from './src/utils/ssrf-validator';

async function run() {
  console.log('Testing 127.0.0.1...');
  try {
    await safeFetch('http://127.0.0.1/');
    console.error('127.0.0.1 FAILED (should have thrown)');
  } catch (err: any) {
    console.log('127.0.0.1 Passed:', err.message);
  }

  console.log('Testing 169.254.169.254...');
  try {
    await safeFetch('http://169.254.169.254/latest/meta-data/');
    console.error('169.254.169.254 FAILED (should have thrown)');
  } catch (err: any) {
    console.log('169.254.169.254 Passed:', err.message);
  }

  console.log('Testing localhost...');
  try {
    await safeFetch('http://localhost:3000');
    console.error('localhost FAILED (should have thrown)');
  } catch (err: any) {
    console.log('localhost Passed:', err.message);
  }
}

run();
