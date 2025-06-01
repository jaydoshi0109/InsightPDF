export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  items: string[];
  priceId: string;
  paymentLink: string;
  features: string[];
  isPopular?: boolean;
}
