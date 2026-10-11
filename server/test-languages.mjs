async function testQuery(message, langName) {
  console.log(`\n========================================`);
  console.log(`Testing [${langName}]: "${message}"`);
  console.log(`========================================`);
  try {
    const res = await fetch('http://localhost:4000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token-test-user',
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    console.log(`STATUS:`, res.status);
    console.log(`AI ANSWER:\n`, data.answer);
    console.log(`SUGGESTIONS:\n`, data.follow_up_suggestions);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

async function run() {
  await testQuery('Bakit naninilaw ang mga dahon ng kamatis ko?', 'TAGALOG');
  await testQuery('Nganong dalag man ang dahon sa akong kamatis? Unsay maayong abono?', 'BISAYA');
  await testQuery('Kanus-a ang maayong oras sa pagbisbis sa mga tanom?', 'BISAYA WATERING');
}

run();
