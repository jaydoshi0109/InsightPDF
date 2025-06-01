import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDbConnection } from "@/lib/db";
import UploadClient from "./upload-client";
export default async function UploadPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  // Get user's subscription status from the database
  const sql = await getDbConnection();
  const userResult = await sql.query(
    `SELECT 
      u.status, 
      u.price_id, 
      u.customer_id, 
      CASE 
        WHEN u.price_id = $1 THEN 'Pro'
        WHEN u.price_id = $2 THEN 'Basic'
        ELSE 'Free'
      END as plan_name,
      CASE 
        WHEN u.price_id = $1 THEN true
        ELSE false
      END as is_pro,
      CASE 
        WHEN u.price_id = $2 THEN true
        ELSE false
      END as is_basic,
      u.status = 'active' as is_active
    FROM users u 
    WHERE u.clerk_id = $3`,
    [
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
      userId
    ]
  );
  const user = userResult.rows[0] || {
    status: 'inactive',
    plan_name: 'Free',
    is_pro: false,
    is_basic: false,
    is_active: false
  };
  return (
    <UploadClient 
      isPro={user.is_pro}
      isBasic={user.is_basic}
      isActive={user.is_active}
      planName={user.plan_name}
    />
  );
}
