async function testCheckUser() {
  try {
    // This is a test user ID - replace with a real Clerk user ID from your application
    const testUserId = 'user_2xhYQdUhpK2oHrzEybpts4xRZW4';
    // Make a request to the check-user endpoint
    const response = await fetch(`http://localhost:3000/api/check-user?userId=${testUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // In a real test, you would include the Clerk session token here
      // headers: {
      //   'Authorization': `Bearer ${process.env.CLERK_SESSION_TOKEN}`,
      //   'Content-Type': 'application/json',
      // },
    });
    const data = await response.json();
    ;
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${data.error || 'Unknown error'}`);
    }
    ;
    return data;
  } catch (error) {
    ;
    ;
    process.exit(1);
  }
}
testCheckUser();
