import { auth } from "@clerk/nextjs/server";
async function checkSubscription() {
  try {
    // Get the current user
    const { userId } = auth();
    if (!userId) {
      ;
      return;
    }
    ;
    // Call the API endpoint
    const response = await fetch('http://localhost:3000/api/user/subscription', {
      headers: {
        'Cookie': document.cookie // Forward auth cookies
      }
    });
    if (!response.ok) {
      ;
      return;
    }
    const data = await response.json();
    ;
    ;
    ;
    ;
    ;
  } catch (error) {
    ;
  }
}
// Run the check
checkSubscription().catch();
